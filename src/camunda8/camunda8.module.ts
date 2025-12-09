import { Module, DynamicModule, Global } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { Camunda8Service } from './services/camunda8.service';
import { WorkerService } from './services/worker.service';
import { DeploymentService } from './services/deployment.service';
import { CoordinatorService } from './services/coordinator.service';
import type { Camunda8Options } from './interfaces/camunda8-options.interface';
import { CAMUNDA8_OPTIONS } from './camunda8.constants';

@Global()
@Module({})
export class Camunda8Module {
  static forRoot(options: Camunda8Options): DynamicModule {
    return {
      module: Camunda8Module,
      providers: [
        {
          provide: CAMUNDA8_OPTIONS,
          useValue: options,
        },
        Camunda8Service,
        DeploymentService,
        WorkerService,
        CoordinatorService,
        DiscoveryService,
      ],
      exports: [Camunda8Service],
    };
  }

  static forRootAsync(options: {
    useFactory: (...args: any[]) => Promise<Camunda8Options> | Camunda8Options;
    inject?: any[];
  }): DynamicModule {
    return {
      module: Camunda8Module,
      providers: [
        {
          provide: CAMUNDA8_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        Camunda8Service,
        DeploymentService,
        WorkerService,
        CoordinatorService,
        DiscoveryService,
      ],
      exports: [Camunda8Service],
    };
  }
}
