import { Injectable, Inject } from '@nestjs/common';
import { Camunda8 } from '@camunda8/sdk';
import type { CamundaClientLoose } from '@camunda8/orchestration-cluster-api';
import type { Camunda8Options } from '../interfaces/camunda8-options.interface';
import { CAMUNDA8_OPTIONS } from '../camunda8.constants';

@Injectable()
export class Camunda8Service {
  private readonly camunda: Camunda8;
  private readonly orchestration: CamundaClientLoose;

  constructor(
    @Inject(CAMUNDA8_OPTIONS)
    private readonly options: Camunda8Options,
  ) {
    this.camunda = new Camunda8({
      CAMUNDA_AUTH_STRATEGY: this.options.CAMUNDA_AUTH_STRATEGY,
      ZEEBE_GRPC_ADDRESS: this.options.ZEEBE_GRPC_ADDRESS,
      ZEEBE_REST_ADDRESS: this.options.ZEEBE_REST_ADDRESS,
      ZEEBE_CLIENT_ID: this.options.ZEEBE_CLIENT_ID,
      ZEEBE_CLIENT_SECRET: this.options.ZEEBE_CLIENT_SECRET,
      CAMUNDA_OAUTH_URL: this.options.CAMUNDA_OAUTH_URL,
    });

    this.orchestration = this.camunda.getOrchestrationClusterApiClientLoose();
  }

  /**
   * Create a process instance
   * @param params - The parameters for creating a process instance
   * @returns The process instance
   */
  async createProcessInstance(params: {
    processDefinitionId: string;
    variables?: Record<string, any>;
  }) {
    return await this.orchestration.createProcessInstance({
      processDefinitionId: params.processDefinitionId,
      variables: params.variables || {},
    });
  }

  /**
   * Deploy resources from files (BPMN, forms, etc.)
   * @param filePaths - The paths to the files to deploy
   * @returns The deployment result
   */
  async deployResourcesFromFiles(filePaths: string[]) {
    return await this.orchestration.deployResourcesFromFiles(filePaths);
  }

  /**
   * Get the orchestration API client
   */
  getOrchestrationClient(): CamundaClientLoose {
    return this.orchestration;
  }

  /**
   * Get the Camunda8 SDK instance
   */
  getCamunda8Client(): Camunda8 {
    return this.camunda;
  }
}
