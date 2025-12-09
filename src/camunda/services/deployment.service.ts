import { Injectable, Inject, Logger } from '@nestjs/common';
import { CamundaService } from './camunda.service';
import { CAMUNDA8_OPTIONS } from '../camunda.constants';
import type { CamundaOptions } from '../interfaces/camunda-options.interface';

/**
 * Service responsible for deploying BPMN and form resources to Camunda
 */
@Injectable()
export class DeploymentService {
  private readonly logger = new Logger(DeploymentService.name);

  constructor(
    private readonly CamundaService: CamundaService,
    @Inject(CAMUNDA8_OPTIONS)
    private readonly options: CamundaOptions,
  ) {}

  /**
   * Deploy the configured BPMN and form files (form is optional)
   * @returns The deployment result
   */
  async deploy() {
    try {
      const { bpmn, form } = this.options.workflow;
      const resourcesToDeploy = [bpmn];

      if (form) {
        resourcesToDeploy.push(form);
        this.logger.log('Deploying BPMN and form resources...');
      } else {
        this.logger.log('Deploying BPMN resources...');
      }

      const orchestration = this.CamundaService.getOrchestrationClient();
      const result =
        await orchestration.deployResourcesFromFiles(resourcesToDeploy);

      const deployedResources = form
        ? `BPMN (${bpmn}), Form (${form})`
        : `BPMN (${bpmn})`;
      this.logger.log(`Successfully deployed resources: ${deployedResources}`);
      return result;
    } catch (error) {
      this.logger.error('Failed to deploy resources', error);
      throw error;
    }
  }
}
