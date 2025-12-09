import { Injectable, Inject } from '@nestjs/common';
import { Camunda8 } from '@camunda8/sdk';
import type { CamundaClientLoose } from '@camunda8/orchestration-cluster-api';
import type { Camunda8Options } from '../interfaces/camunda8-options.interface';
import { mapToSdkConfiguration } from '../interfaces/camunda8-options.interface';
import { CAMUNDA8_OPTIONS } from '../camunda8.constants';

@Injectable()
export class Camunda8Service {
  private readonly camunda: Camunda8;
  private readonly orchestration: CamundaClientLoose;

  constructor(
    @Inject(CAMUNDA8_OPTIONS)
    private readonly options: Camunda8Options,
  ) {
    const sdkConfig = mapToSdkConfiguration(options);
    this.camunda = new Camunda8(sdkConfig);

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
