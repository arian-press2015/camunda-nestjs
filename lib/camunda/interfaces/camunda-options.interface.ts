import type { Camunda8ClientConfiguration } from '@camunda8/sdk/dist/lib';

/**
 * Client connection and authentication configuration for forRoot()
 */
export interface CamundaClientOptions {
  /**
   * Authentication strategy: 'OAUTH', 'BASIC', 'BEARER', 'COOKIE', or 'NONE'
   */
  authStrategy: 'OAUTH' | 'BASIC' | 'BEARER' | 'COOKIE' | 'NONE';
  /**
   * Zeebe gRPC address (e.g., 'grpc://localhost:26500')
   */
  zeebeGrpcAddress: string;
  /**
   * Zeebe REST address (e.g., 'http://localhost:8088')
   */
  zeebeRestAddress: string;
  /**
   * OAuth client ID
   */
  clientId: string;
  /**
   * OAuth client secret
   */
  clientSecret: string;
  /**
   * OAuth token URL
   */
  oauthUrl: string;
  /**
   * Optional token cache directory
   */
  tokenCacheDir?: string;
  /**
   * Optional flag to disable token disk cache
   */
  tokenDiskCacheDisable?: boolean;
}

/**
 * Workflow deployment configuration for forFeature()
 */
export interface CamundaWorkflowOptions {
  /**
   * Unique workflow name to identify this workflow and link workers to it
   */
  workflowName: string;
  /**
   * Path to the BPMN file to deploy
   */
  bpmn: string;
  /**
   * Array of form file paths to deploy (can be empty array for no forms)
   */
  forms: string[];
}

/**
 * Legacy interface for backward compatibility (deprecated)
 * @deprecated Use CamundaClientOptions for forRoot() and CamundaWorkflowOptions for forFeature()
 */
export interface CamundaOptions {
  client: CamundaClientOptions;
  workflow: {
    bpmn: string;
    form?: string;
  };
}

/**
 * Maps CamundaClientOptions to SDK's Camunda8ClientConfiguration
 */
export function mapToSdkConfiguration(
  options: CamundaClientOptions,
): Camunda8ClientConfiguration {
  return {
    CAMUNDA_AUTH_STRATEGY: options.authStrategy,
    ZEEBE_GRPC_ADDRESS: options.zeebeGrpcAddress,
    ZEEBE_REST_ADDRESS: options.zeebeRestAddress,
    ZEEBE_CLIENT_ID: options.clientId,
    ZEEBE_CLIENT_SECRET: options.clientSecret,
    CAMUNDA_OAUTH_URL: options.oauthUrl,
    CAMUNDA_TOKEN_CACHE_DIR: options.tokenCacheDir,
    CAMUNDA_TOKEN_DISK_CACHE_DISABLE: options.tokenDiskCacheDisable,
  };
}
