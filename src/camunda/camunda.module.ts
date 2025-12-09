import { Module, DynamicModule, Global } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { CamundaService } from './services/camunda.service';
import { WorkerService } from './services/worker.service';
import { DeploymentService } from './services/deployment.service';
import { CoordinatorService } from './services/coordinator.service';
import type {
  CamundaClientOptions,
  CamundaWorkflowOptions,
} from './interfaces/camunda-options.interface';
import {
  CAMUNDA8_OPTIONS,
  CAMUNDA8_WORKFLOW_OPTIONS,
} from './camunda.constants';

@Global()
@Module({})
export class CamundaModule {
  /**
   * Configure the Camunda8 client connection.
   * This should be called once in the root module.
   *
   * @param options Client connection and authentication options
   * @example
   * ```typescript
   * CamundaModule.forRoot({
   *   authStrategy: 'OAUTH',
   *   zeebeGrpcAddress: 'grpc://localhost:26500',
   *   zeebeRestAddress: 'http://localhost:8088',
   *   clientId: 'orchestration',
   *   clientSecret: 'secret',
   *   oauthUrl: 'http://localhost:18080/auth/realms/camunda-platform/protocol/openid-connect/token',
   * })
   * ```
   */
  static forRoot(options: CamundaClientOptions): DynamicModule {
    return {
      module: CamundaModule,
      providers: [
        {
          provide: CAMUNDA8_OPTIONS,
          useValue: options,
        },
        CamundaService,
        DiscoveryService,
      ],
      exports: [CamundaService],
    };
  }

  /**
   * Configure the Camunda8 client connection asynchronously.
   * This should be called once in the root module.
   *
   * @param options Factory function and dependencies for client options
   * @example
   * ```typescript
   * CamundaModule.forRootAsync({
   *   useFactory: (config: ConfigService) => ({
   *     authStrategy: 'OAUTH',
   *     zeebeGrpcAddress: config.get('ZEEBE_GRPC_ADDRESS'),
   *     // ...
   *   }),
   *   inject: [ConfigService],
   * })
   * ```
   */
  static forRootAsync(options: {
    useFactory: (
      ...args: any[]
    ) => Promise<CamundaClientOptions> | CamundaClientOptions;
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
        DiscoveryService,
      ],
      exports: [CamundaService],
    };
  }

  /**
   * Register a workflow with its BPMN file and workers.
   * This can be called multiple times for different workflows.
   *
   * @param options Workflow configuration including workflow name, BPMN file, and optional form
   * @example
   * ```typescript
   * CamundaModule.forFeature({
   *   workflowName: 'order-workflow',
   *   bpmn: './assets/order.bpmn',
   *   form: './assets/order.form', // optional
   * })
   * ```
   */
  static forFeature(options: CamundaWorkflowOptions): DynamicModule {
    return {
      module: CamundaModule,
      providers: [
        {
          provide: CAMUNDA8_WORKFLOW_OPTIONS,
          useValue: options,
        },
        DeploymentService,
        WorkerService,
        CoordinatorService,
        DiscoveryService,
      ],
      exports: [DeploymentService],
    };
  }

  /**
   * Register a workflow with its BPMN file and workers asynchronously.
   * This can be called multiple times for different workflows.
   *
   * @param options Factory function and dependencies for workflow options
   * @example
   * ```typescript
   * CamundaModule.forFeatureAsync({
   *   useFactory: (config: ConfigService) => ({
   *     workflowName: 'order-workflow',
   *     bpmn: config.get('ORDER_BPMN_PATH'),
   *   }),
   *   inject: [ConfigService],
   * })
   * ```
   */
  static forFeatureAsync(options: {
    useFactory: (
      ...args: any[]
    ) => Promise<CamundaWorkflowOptions> | CamundaWorkflowOptions;
    inject?: any[];
  }): DynamicModule {
    return {
      module: CamundaModule,
      providers: [
        {
          provide: CAMUNDA8_WORKFLOW_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        DeploymentService,
        WorkerService,
        CoordinatorService,
        DiscoveryService,
      ],
      exports: [DeploymentService],
    };
  }
}
