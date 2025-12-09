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
   * Deploy the configured BPMN and form files
   * @returns The deployment result
   */
  async deploy() {
    try {
      const { bpmn, forms, workflowName } = this.options;
      const resourcesToDeploy = [bpmn];

      if (forms.length > 0) {
        resourcesToDeploy.push(...forms);
        this.logger.log(
          `[${workflowName}] Deploying BPMN and ${forms.length} form resource(s)...`,
        );
      } else {
        this.logger.log(`[${workflowName}] Deploying BPMN resources...`);
      }

      const orchestration = this.CamundaService.getOrchestrationClient();
      const result =
        await orchestration.deployResourcesFromFiles(resourcesToDeploy);

      const formResources =
        forms.length > 0
          ? `, ${forms.length} form(s): ${forms.join(', ')}`
          : '';
      const deployedResources = `BPMN (${bpmn})${formResources}`;
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
