import type { Camunda8ClientConfiguration } from '@camunda8/sdk/dist/lib';

/**
 * Simplified Camunda8 module options with lowercase keys.
 * This interface is mapped to the SDK's uppercase configuration internally.
 */
export interface Camunda8Options {
  /**
   * Client connection and authentication configuration
   */
  client: {
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
  };
  /**
   * Workflow deployment configuration
   */
  workflow: {
    /**
     * Path to the BPMN file to deploy
     */
    bpmn: string;
    /**
     * Path to the form file to deploy
     */
    form: string;
  };
}

/**
 * Maps simplified Camunda8Options to SDK's Camunda8ClientConfiguration
 */
export function mapToSdkConfiguration(
  options: Camunda8Options,
): Camunda8ClientConfiguration {
  return {
    CAMUNDA_AUTH_STRATEGY: options.client.authStrategy,
    ZEEBE_GRPC_ADDRESS: options.client.zeebeGrpcAddress,
    ZEEBE_REST_ADDRESS: options.client.zeebeRestAddress,
    ZEEBE_CLIENT_ID: options.client.clientId,
    ZEEBE_CLIENT_SECRET: options.client.clientSecret,
    CAMUNDA_OAUTH_URL: options.client.oauthUrl,
    CAMUNDA_TOKEN_CACHE_DIR: options.client.tokenCacheDir,
    CAMUNDA_TOKEN_DISK_CACHE_DISABLE: options.client.tokenDiskCacheDisable,
  };
}
