import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { DiscoveryService, MetadataScanner } from '@nestjs/core';
import type { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Camunda8Service } from './camunda8.service';
import { WORKER_JOB_METADATA_KEY } from '../camunda8.constants';
import 'reflect-metadata';
import { Camunda8WorkerJobMetadata } from '../interfaces/camunda8-worker-job-metadata.interface';
import type { CamundaClientLoose } from '@camunda8/orchestration-cluster-api';

@Injectable()
export class WorkerService implements OnModuleInit {
  private readonly logger = new Logger(WorkerService.name);

  constructor(
    private readonly camunda8Service: Camunda8Service,
    private readonly discoveryService: DiscoveryService,
    private readonly scanner: MetadataScanner,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.registerWorkers();
  }

  private async registerWorkers(): Promise<void> {
    try {
      const orchestration = this.camunda8Service.getOrchestrationClient();

      const providers: InstanceWrapper[] = this.discoveryService.getProviders();

      for (const wrapper of providers) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const instance = wrapper.instance;

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
            await this.registerWorker(
              orchestration,
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

  private async registerWorker(
    orchestration: CamundaClientLoose,
    jobType: string,
    instance: object,
    methodName: string,
  ) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const handler = instance[methodName].bind(instance);

      const result = await orchestration.activateJobs({
        type: jobType,
        maxJobsToActivate: 1,
        timeout: 60000,
        worker: 'order-worker',
      });

      for (const job of result.jobs) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        await handler(job);
      }
    } catch (error) {
      this.logger.error('Error registering worker', error);
      throw error;
    }
  }
}
