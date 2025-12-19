import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common';
import { CamundaDeploymentService } from './camunda-deployment.service';
import { CamundaWorkerService } from './camunda-worker.service';
import { CAMUNDA8_WORKFLOW_OPTIONS } from '../camunda.constants';
import { CamundaWorkflowOptionsDTO } from '../dtos/camunda-workflow-options.dto';

/**
 * Coordinator service that orchestrates the initialization order of
 * deployment and worker registration services for a specific workflow.
 */
@Injectable()
export class CamundaCoordinatorService implements OnModuleInit {
  private readonly logger = new Logger(CamundaCoordinatorService.name);

  constructor(
    private readonly deploymentService: CamundaDeploymentService,
    private readonly workerService: CamundaWorkerService,
    @Inject(CAMUNDA8_WORKFLOW_OPTIONS)
    private readonly workflowOptions: CamundaWorkflowOptionsDTO,
  ) {}

  /**
   * Initialize services in the correct order:
   * 1. Deploy BPMN and form files
   * 2. Register workers
   */
  async onModuleInit(): Promise<void> {
    this.logger.log(
      `[${this.workflowOptions.workflowName}] Starting Camunda8 workflow initialization...`,
    );

    try {
      // Step 1: Deploy resources first
      await this.deploymentService.deploy();

      // Step 2: Register workers after deployment completes
      await this.workerService.registerWorkers();

      this.logger.log(
        `[${this.workflowOptions.workflowName}] Camunda8 workflow initialization completed`,
      );
    } catch (error) {
      this.logger.error(
        `[${this.workflowOptions.workflowName}] Failed to initialize Camunda8 workflow`,
        error,
      );
      throw error;
    }
  }
}
