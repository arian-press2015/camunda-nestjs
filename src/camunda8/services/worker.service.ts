import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { DiscoveryService, MetadataScanner } from '@nestjs/core';
import type { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Camunda8Service } from './camunda8.service';
import { WORKER_JOB_METADATA_KEY } from '../camunda8.constants';
import 'reflect-metadata';
import { Camunda8WorkerJobMetadata } from '../interfaces/camunda8-worker-job-metadata.interface';
import type { ZeebeGrpcClient } from '@camunda8/sdk/dist/zeebe/zb/ZeebeGrpcClient';
import type { ZBWorker } from '@camunda8/sdk/dist/zeebe';
import type {
  IInputVariables,
  ICustomHeaders,
  IOutputVariables,
  ZeebeJob,
} from '@camunda8/sdk/dist/zeebe/lib/interfaces-1.0';

@Injectable()
export class WorkerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WorkerService.name);
  private readonly workers: ZBWorker<
    IInputVariables,
    ICustomHeaders,
    IOutputVariables
  >[] = [];

  constructor(
    private readonly camunda8Service: Camunda8Service,
    private readonly discoveryService: DiscoveryService,
    private readonly scanner: MetadataScanner,
  ) {}

  onModuleInit(): void {
    this.registerWorkers();
  }

  private registerWorkers(): void {
    try {
      const camunda8Client = this.camunda8Service.getCamunda8Client();
      const zeebeClient = camunda8Client.getZeebeGrpcApiClient();

      const providers: InstanceWrapper[] = this.discoveryService.getProviders();

      for (const wrapper of providers) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const instance: object = wrapper.instance;

        if (!instance || typeof instance !== 'object') {
          continue;
        }

        const methods = this.getMethods(instance);

        for (const methodName of methods) {
          const metadata = Reflect.getMetadata(
            WORKER_JOB_METADATA_KEY,
            instance,
            methodName,
          ) as Camunda8WorkerJobMetadata | undefined;

          if (metadata) {
            this.registerWorker(
              zeebeClient,
              metadata.jobType,
              instance,
              methodName,
            );
          }
        }
      }
    } catch (error) {
      this.logger.error('Error registering workers', error);
      throw error;
    }
  }

  private getMethods(instance: object): string[] {
    const methods: string[] = [];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const proto: object = Object.getPrototypeOf(instance);

    this.scanner.getAllMethodNames(proto).forEach((methodName) => {
      if (
        methodName !== 'constructor' &&
        typeof proto[methodName] === 'function' &&
        !methods.includes(methodName)
      ) {
        methods.push(methodName);
      }
    });

    return methods;
  }

  private registerWorker(
    zeebeClient: ZeebeGrpcClient,
    jobType: string,
    instance: object,
    methodName: string,
  ): void {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const handler = instance[methodName].bind(instance);
      const worker = zeebeClient.createWorker({
        taskType: jobType,
        taskHandler: async (
          job: Readonly<
            ZeebeJob<IInputVariables, ICustomHeaders, IOutputVariables>
          >,
        ) => {
          this.logger.debug(`Processing job ${jobType} with key ${job.key}`);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
          return await handler(job);
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
