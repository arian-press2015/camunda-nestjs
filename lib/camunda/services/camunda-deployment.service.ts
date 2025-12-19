import { Injectable, Inject, Logger } from '@nestjs/common';
import { CamundaClientService } from './camunda-client.service';
import { CAMUNDA8_WORKFLOW_OPTIONS } from '../camunda.constants';
import { CamundaWorkflowOptionsDTO } from '../dtos/camunda-workflow-options.dto';

/**
 * Service responsible for deploying BPMN and form resources to Camunda
 */
@Injectable()
export class CamundaDeploymentService {
  private readonly logger = new Logger(CamundaDeploymentService.name);

  constructor(
    private readonly CamundaClientService: CamundaClientService,
    @Inject(CAMUNDA8_WORKFLOW_OPTIONS)
    private readonly options: CamundaWorkflowOptionsDTO,
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

      const orchestration = this.CamundaClientService.getOrchestrationClient();
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
