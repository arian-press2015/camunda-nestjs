import {
  IsEnum,
  IsString,
  IsUrl,
  IsOptional,
  IsNotEmpty,
  MinLength,
} from 'class-validator';
import { Camunda8ClientConfiguration } from '@camunda8/sdk/dist/lib';
import { CamundaClientOptions } from '../interfaces/camunda-options.interface';
import { plainToInstance } from 'class-transformer';

/**
 * Client connection and authentication configuration for forRoot()
 */
export class CamundaClientOptionsDTO {
  /**
   * Authentication strategy: 'OAUTH', 'BASIC', 'BEARER', 'COOKIE', or 'NONE'
   */
  @IsEnum(['OAUTH', 'BASIC', 'BEARER', 'COOKIE', 'NONE'], {
    message: 'authStrategy must be one of: OAUTH, BASIC, BEARER, COOKIE, NONE',
  })
  authStrategy: 'OAUTH' | 'BASIC' | 'BEARER' | 'COOKIE' | 'NONE';

  /**
   * Zeebe gRPC address (e.g., 'grpc://localhost:26500')
   */
  @IsString({ message: 'zeebeGrpcAddress must be a string' })
  @IsNotEmpty({ message: 'zeebeGrpcAddress is required' })
  @IsUrl(
    {
      protocols: ['grpc', 'grpcs'],
      require_protocol: true,
      require_tld: false,
    },
    {
      message:
        'zeebeGrpcAddress must be a valid gRPC URL (e.g., grpc://localhost:26500)',
    },
  )
  zeebeGrpcAddress: string;

  /**
   * Zeebe REST address (e.g., 'http://localhost:8088')
   */
  @IsString({ message: 'zeebeRestAddress must be a string' })
  @IsNotEmpty({ message: 'zeebeRestAddress is required' })
  @IsUrl(
    {
      protocols: ['http', 'https'],
      require_protocol: true,
      require_tld: false,
    },
    {
      message:
        'zeebeRestAddress must be a valid HTTP/HTTPS URL (e.g., http://localhost:8088)',
    },
  )
  zeebeRestAddress: string;

  /**
   * OAuth client ID
   */
  @IsString({ message: 'clientId must be a string' })
  @IsNotEmpty({ message: 'clientId is required' })
  @MinLength(1, { message: 'clientId cannot be empty' })
  clientId: string;

  /**
   * OAuth client secret
   */
  @IsString({ message: 'clientSecret must be a string' })
  @IsNotEmpty({ message: 'clientSecret is required' })
  @MinLength(1, { message: 'clientSecret cannot be empty' })
  clientSecret: string;

  /**
   * OAuth token URL
   */
  @IsString({ message: 'oauthUrl must be a string' })
  @IsNotEmpty({ message: 'oauthUrl is required' })
  @IsUrl(
    {
      protocols: ['http', 'https'],
      require_protocol: true,
      require_tld: false,
    },
    {
      message: 'oauthUrl must be a valid HTTP/HTTPS URL',
    },
  )
  oauthUrl: string;

  /**
   * Optional token cache directory
   */
  @IsOptional()
  @IsString({ message: 'tokenCacheDir must be a string' })
  tokenCacheDir?: string;

  /**
   * Optional flag to disable token disk cache
   */
  @IsOptional()
  tokenDiskCacheDisable?: boolean;

  /**
   * Maps CamundaClientOptions to SDK's Camunda8ClientConfiguration
   */
  toSdkConfiguration(): Camunda8ClientConfiguration {
    return {
      CAMUNDA_AUTH_STRATEGY: this.authStrategy,
      ZEEBE_GRPC_ADDRESS: this.zeebeGrpcAddress,
      ZEEBE_REST_ADDRESS: this.zeebeRestAddress,
      ZEEBE_CLIENT_ID: this.clientId,
      ZEEBE_CLIENT_SECRET: this.clientSecret,
      CAMUNDA_OAUTH_URL: this.oauthUrl,
      CAMUNDA_TOKEN_CACHE_DIR: this.tokenCacheDir,
      CAMUNDA_TOKEN_DISK_CACHE_DISABLE: this.tokenDiskCacheDisable,
    };
  }

  static fromCamundaClientOptions(
    options: CamundaClientOptions,
  ): CamundaClientOptionsDTO {
    return plainToInstance(CamundaClientOptionsDTO, options);
  }
}
