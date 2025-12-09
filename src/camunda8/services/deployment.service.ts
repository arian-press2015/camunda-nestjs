import { Injectable, Inject, Logger } from '@nestjs/common';
import { Camunda8Service } from './camunda8.service';
import { CAMUNDA8_OPTIONS } from '../camunda8.constants';
import type { Camunda8Options } from '../interfaces/camunda8-options.interface';

/**
 * Service responsible for deploying BPMN and form resources to Camunda8
 */
@Injectable()
export class DeploymentService {
  private readonly logger = new Logger(DeploymentService.name);

  constructor(
    private readonly camunda8Service: Camunda8Service,
    @Inject(CAMUNDA8_OPTIONS)
    private readonly options: Camunda8Options,
  ) {}

  /**
   * Deploy the configured BPMN and form files
   * @returns The deployment result
   */
  async deploy() {
    try {
      this.logger.log('Deploying BPMN and form resources...');
      const { bpmn, form } = this.options.workflow;

      const orchestration = this.camunda8Service.getOrchestrationClient();
      const result = await orchestration.deployResourcesFromFiles([bpmn, form]);

      this.logger.log(
        `Successfully deployed resources: BPMN (${bpmn}), Form (${form})`,
      );
      return result;
    } catch (error) {
      this.logger.error('Failed to deploy resources', error);
      throw error;
    }
  }
}
