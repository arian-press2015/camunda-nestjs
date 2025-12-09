import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import type { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { CamundaService } from './camunda.service';
import { WORKER_JOB_METADATA_KEY } from '../camunda.constants';
import 'reflect-metadata';
import { Camunda8WorkerJobMetadata } from '../interfaces/camunda-worker-job-metadata.interface';
import { Camunda8WorkerHandler } from '../base/camunda-worker-handler.base';
import type { ZeebeGrpcClient } from '@camunda8/sdk/dist/zeebe/zb/ZeebeGrpcClient';
import type { ZBWorker } from '@camunda8/sdk/dist/zeebe';
import type {
  IInputVariables,
  ICustomHeaders,
  IOutputVariables,
  ZeebeJob,
} from '@camunda8/sdk/dist/zeebe/lib/interfaces-1.0';

@Injectable()
export class WorkerService implements OnModuleDestroy {
  private readonly logger = new Logger(WorkerService.name);
  private readonly workers: ZBWorker<
    IInputVariables,
    ICustomHeaders,
    IOutputVariables
  >[] = [];

  constructor(
    private readonly CamundaService: CamundaService,
    private readonly discoveryService: DiscoveryService,
  ) {}

  /**
   * Register all worker handlers discovered in the application.
   * This method is called by CoordinatorService after deployment.
   */
  registerWorkers(): void {
    try {
      const camunda8Client = this.CamundaService.getCamunda8Client();
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
        const metadata = Reflect.getMetadata(
          WORKER_JOB_METADATA_KEY,
          constructor,
        ) as Camunda8WorkerJobMetadata | undefined;

        if (!metadata) {
          continue;
        }

        if (!(instance instanceof Camunda8WorkerHandler)) {
          this.logger.error(
            `Class ${constructor.name} is decorated with @WorkerJob but does not extend Camunda8WorkerHandler base class`,
          );
          continue;
        }

        this.registerWorker(
          zeebeClient,
          metadata.jobType,
          instance as Camunda8WorkerHandler<
            IInputVariables,
            IOutputVariables,
            ICustomHeaders
          >,
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
    handler: Camunda8WorkerHandler<
      IInputVariables,
      IOutputVariables,
      ICustomHeaders
    >,
  ): void {
    try {
      const worker = zeebeClient.createWorker({
        taskType: jobType,
        taskHandler: async (
          job: Readonly<
            ZeebeJob<IInputVariables, ICustomHeaders, IOutputVariables>
          >,
        ) => {
          this.logger.debug(`Processing job ${jobType} with key ${job.key}`);
          return await handler.handle(job);
        },
      });

      this.workers.push(worker);
      this.logger.log(`Registered worker for job type: ${jobType}`);
    } catch (error) {
      this.logger.error(
        `Failed to register worker for job type: ${jobType}`,
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
