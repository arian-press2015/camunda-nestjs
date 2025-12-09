import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common';
import { DeploymentService } from './deployment.service';
import { WorkerService } from './worker.service';
import { CAMUNDA8_WORKFLOW_OPTIONS } from '../camunda.constants';
import type { CamundaWorkflowOptions } from '../interfaces/camunda-options.interface';

/**
 * Coordinator service that orchestrates the initialization order of
 * deployment and worker registration services for a specific workflow.
 */
@Injectable()
export class CoordinatorService implements OnModuleInit {
  private readonly logger = new Logger(CoordinatorService.name);

  constructor(
    private readonly deploymentService: DeploymentService,
    private readonly workerService: WorkerService,
    @Inject(CAMUNDA8_WORKFLOW_OPTIONS)
    private readonly workflowOptions: CamundaWorkflowOptions,
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
      this.workerService.registerWorkers();

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
