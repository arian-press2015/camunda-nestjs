import { Module, DynamicModule, Global } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { CamundaService } from './services/camunda.service';
import { WorkerService } from './services/worker.service';
import { DeploymentService } from './services/deployment.service';
import { CoordinatorService } from './services/coordinator.service';
import type { CamundaOptions } from './interfaces/camunda-options.interface';
import { CAMUNDA8_OPTIONS } from './camunda.constants';

@Global()
@Module({})
export class CamundaModule {
  static forRoot(options: CamundaOptions): DynamicModule {
    return {
      module: CamundaModule,
      providers: [
        {
          provide: CAMUNDA8_OPTIONS,
          useValue: options,
        },
        CamundaService,
        DeploymentService,
        WorkerService,
        CoordinatorService,
        DiscoveryService,
      ],
      exports: [CamundaService],
    };
  }

  static forRootAsync(options: {
    useFactory: (...args: any[]) => Promise<CamundaOptions> | CamundaOptions;
    inject?: any[];
  }): DynamicModule {
    return {
      module: CamundaModule,
      providers: [
        {
          provide: CAMUNDA8_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        CamundaService,
        DeploymentService,
        WorkerService,
        CoordinatorService,
        DiscoveryService,
      ],
      exports: [CamundaService],
    };
  }
}
