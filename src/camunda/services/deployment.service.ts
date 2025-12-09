import { Injectable, Inject, Logger } from '@nestjs/common';
import { CamundaService } from './camunda.service';
import { CAMUNDA8_WORKFLOW_OPTIONS } from '../camunda.constants';
import type { CamundaWorkflowOptions } from '../interfaces/camunda-options.interface';

/**
 * Service responsible for deploying BPMN and form resources to Camunda
 */
@Injectable()
export class DeploymentService {
  private readonly logger = new Logger(DeploymentService.name);

  constructor(
    private readonly CamundaService: CamundaService,
    @Inject(CAMUNDA8_WORKFLOW_OPTIONS)
    private readonly options: CamundaWorkflowOptions,
  ) {}

  /**
   * Deploy the configured BPMN and form files (form is optional)
   * @returns The deployment result
   */
  async deploy() {
    try {
      const { bpmn, form, workflowName } = this.options;
      const resourcesToDeploy = [bpmn];

      if (form) {
        resourcesToDeploy.push(form);
        this.logger.log(
          `[${workflowName}] Deploying BPMN and form resources...`,
        );
      } else {
        this.logger.log(`[${workflowName}] Deploying BPMN resources...`);
      }

      const orchestration = this.CamundaService.getOrchestrationClient();
      const result =
        await orchestration.deployResourcesFromFiles(resourcesToDeploy);

      const deployedResources = form
        ? `BPMN (${bpmn}), Form (${form})`
        : `BPMN (${bpmn})`;
      this.logger.log(
        `[${workflowName}] Successfully deployed resources: ${deployedResources}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `[${this.options.workflowName}] Failed to deploy resources`,
        error,
      );
      throw error;
    }
  }
}
