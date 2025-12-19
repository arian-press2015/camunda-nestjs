import { Injectable, OnModuleDestroy, Logger, Inject } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import type { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { CamundaClientService } from './camunda-client.service';
import { WORKER_JOB_METADATA_KEY, CAMUNDA8_WORKFLOW_OPTIONS } from '../camunda.constants';
import 'reflect-metadata';
import { Camunda8WorkerJobMetadataDTO } from '../dtos/camunda-worker-job-metadata.dto';
import { Camunda8WorkerHandler } from '../base/camunda-worker-handler.base';
import { CamundaWorkflowOptionsDTO } from '../dtos/camunda-workflow-options.dto';
import type { ZeebeGrpcClient } from '@camunda8/sdk/dist/zeebe/zb/ZeebeGrpcClient';
import type { ZBWorker } from '@camunda8/sdk/dist/zeebe';
import type {
  IInputVariables,
  ICustomHeaders,
  IOutputVariables,
  ZeebeJob,
} from '@camunda8/sdk/dist/zeebe/lib/interfaces-1.0';
import { validateWorkerJobMetadata } from '../utils/validation.util';

@Injectable()
export class CamundaWorkerService implements OnModuleDestroy {
  private readonly logger = new Logger(CamundaWorkerService.name);
  private readonly workers: ZBWorker<IInputVariables, ICustomHeaders, IOutputVariables>[] = [];

  constructor(
    private readonly CamundaClientService: CamundaClientService,
    private readonly discoveryService: DiscoveryService,
    @Inject(CAMUNDA8_WORKFLOW_OPTIONS)
    private readonly workflowOptions: CamundaWorkflowOptionsDTO,
  ) {}

  /**
   * Register all worker handlers discovered in the application that belong to this workflow.
   * This method is called by CamundaCoordinatorService after deployment.
   */
  async registerWorkers(): Promise<void> {
    try {
      const camunda8Client = this.CamundaClientService.getCamunda8Client();
      const zeebeClient = camunda8Client.getZeebeGrpcApiClient();

      const providers: InstanceWrapper[] = this.discoveryService.getProviders();

      for (const wrapper of providers) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const instance: object = wrapper.instance;

        if (!instance || typeof instance !== 'object') {
          continue;
        }

        // Get metadata from the class constructor (class decorator)
        const constructor = instance.constructor;
        const metadata = Reflect.getMetadata(WORKER_JOB_METADATA_KEY, constructor) as
          | Camunda8WorkerJobMetadataDTO
          | undefined;

        if (!metadata) {
          continue;
        }

        // Only register workers that belong to this workflow
        if (metadata.workflowName !== this.workflowOptions.workflowName) {
          continue;
        }

        if (!(instance instanceof Camunda8WorkerHandler)) {
          this.logger.error(
            `Class ${constructor.name} is decorated with @WorkerJob but does not extend Camunda8WorkerHandler base class`,
          );
          continue;
        }

        await validateWorkerJobMetadata(Camunda8WorkerJobMetadataDTO.fromCamunda8WorkerJobMetadata(metadata));

        this.registerWorker(
          zeebeClient,
          metadata.jobType,
          instance as Camunda8WorkerHandler<IInputVariables, IOutputVariables, ICustomHeaders>,
        );
      }
    } catch (error) {
      this.logger.error('Error registering workers', error);
      throw error;
    }
  }

  private registerWorker(
    zeebeClient: ZeebeGrpcClient,
    jobType: string,
    handler: Camunda8WorkerHandler<IInputVariables, IOutputVariables, ICustomHeaders>,
  ): void {
    try {
      const worker = zeebeClient.createWorker({
        taskType: jobType,
        taskHandler: async (job: Readonly<ZeebeJob<IInputVariables, ICustomHeaders, IOutputVariables>>) => {
          this.logger.debug(`[${this.workflowOptions.workflowName}] Processing job ${jobType} with key ${job.key}`);
          try {
            return await handler.handle(job);
          } catch (error) {
            this.logger.error(
              `[${this.workflowOptions.workflowName}] Error processing job ${jobType} with key ${job.key}`,
              error,
            );
            throw error;
          }
        },
      });

      this.workers.push(worker);
      this.logger.log(`[${this.workflowOptions.workflowName}] Registered worker for job type: ${jobType}`);
    } catch (error) {
      this.logger.error(
        `[${this.workflowOptions.workflowName}] Failed to register worker for job type: ${jobType}`,
        error,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Shutting down workers...');
    for (const worker of this.workers) {
      try {
        await worker.close();
      } catch (error) {
        this.logger.error('Error closing worker', error);
      }
    }

    this.workers.length = 0;
  }
}
