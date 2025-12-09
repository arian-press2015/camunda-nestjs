import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DeploymentService } from './deployment.service';
import { WorkerService } from './worker.service';

/**
 * Coordinator service that orchestrates the initialization order of
 * deployment and worker registration services.
 */
@Injectable()
export class CoordinatorService implements OnModuleInit {
  private readonly logger = new Logger(CoordinatorService.name);

  constructor(
    private readonly deploymentService: DeploymentService,
    private readonly workerService: WorkerService,
  ) {}

  /**
   * Initialize services in the correct order:
   * 1. Deploy BPMN and form files
   * 2. Register workers
   */
  async onModuleInit(): Promise<void> {
    this.logger.log('Starting Camunda8 module initialization...');

    try {
      // Step 1: Deploy resources first
      await this.deploymentService.deploy();

      // Step 2: Register workers after deployment completes
      this.workerService.registerWorkers();

      this.logger.log('Camunda8 module initialization completed');
    } catch (error) {
      this.logger.error('Failed to initialize Camunda8 module', error);
      throw error;
    }
  }
}
