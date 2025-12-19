# camunda-nestjs

[![npm version](https://img.shields.io/npm/v/camunda-nestjs)](https://www.npmjs.com/package/camunda-nestjs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![Status](https://img.shields.io/badge/status-beta-orange)

A powerful NestJS module for integrating Camunda8 workflow engine with automatic worker discovery, workflow management, and seamless BPMN deployment.

> ⚠️ **Beta Notice**: This package is under active development. The API may change between minor versions until we reach `1.0.0`. We recommend pinning to a specific version for production use.
>
> Found a bug or have a suggestion? Please [open an issue](https://github.com/arian-press2015/camunda-nestjs/issues) – your feedback helps us improve!

## Features

- 🚀 **Easy Setup**: Simple configuration with `forRoot()` and `forFeature()` pattern
- 🔍 **Automatic Worker Discovery**: Automatically discovers and registers workers using decorators
- 📦 **Workflow Management**: Deploy multiple workflows with separate BPMN files and forms
- 🎯 **Type-Safe**: Full TypeScript support with type-safe worker handlers
- 🔗 **Workflow Linking**: Link workers to specific workflows using workflow names
- 📝 **BPMN & Forms**: Deploy BPMN files and multiple form files per workflow
- 🛡️ **Error Handling**: Built-in error handling and job completion/failure management

## Installation

```bash
npm install camunda-nestjs
```

## Peer Dependencies

- `@nestjs/common`: ^10.0.0 || ^11.0.0
- `@nestjs/core`: ^10.0.0 || ^11.0.0
- `class-transformer`: ^0.5.0
- `class-validator`: ^0.14.0
- `reflect-metadata`: ^0.1.13 || ^0.2.0
- `rxjs`: ^7.2.0

## Quick Start

### 1. Configure the Client

In your root module (e.g., `app.module.ts`), configure the Camunda8 client:

```typescript
import { Module } from '@nestjs/common';
import { CamundaModule } from 'camunda-nestjs';

@Module({
  imports: [
    CamundaModule.forRoot({
      authStrategy: 'OAUTH',
      zeebeGrpcAddress: 'grpc://localhost:26500',
      zeebeRestAddress: 'http://localhost:8088',
      clientId: 'orchestration',
      clientSecret: 'secret',
      oauthUrl: 'http://localhost:18080/auth/realms/camunda-platform/protocol/openid-connect/token',
    }),
  ],
})
export class AppModule {}
```

### 2. Register a Workflow

Register your workflow with BPMN and form files:

```typescript
@Module({
  imports: [
    CamundaModule.forRoot({
      /* ... */
    }),
    CamundaModule.forFeature({
      workflowName: 'order-workflow',
      bpmn: './assets/order.bpmn',
      forms: ['./assets/order.form', './assets/approval.form'], // Can be empty array []
    }),
  ],
})
export class AppModule {}
```

### 3. Create Worker Handlers

Create worker handlers that extend `Camunda8WorkerHandler`:

```typescript
import { Injectable } from '@nestjs/common';
import { WorkerJob, Camunda8WorkerHandler } from 'camunda-nestjs';
import type {
  ZeebeJob,
  IInputVariables,
  IOutputVariables,
  ICustomHeaders,
  JOB_ACTION_ACKNOWLEDGEMENT,
} from '@camunda8/sdk/dist/zeebe/lib/interfaces-1.0';

interface PaymentInput extends IInputVariables {
  amount: number;
  currency: string;
  recipient: string;
}

interface PaymentOutput extends IOutputVariables {
  transactionId: string;
  status: 'success' | 'failed';
}

@WorkerJob('payment-processing', 'order-workflow')
@Injectable()
export class PaymentHandler extends Camunda8WorkerHandler<PaymentInput, PaymentOutput> {
  async handle(
    job: Readonly<ZeebeJob<PaymentInput, ICustomHeaders, PaymentOutput>>,
  ): Promise<typeof JOB_ACTION_ACKNOWLEDGEMENT> {
    const { amount, currency, recipient } = job.variables;

    try {
      // Process payment logic
      const transactionId = await this.processPayment(amount, currency, recipient);

      // Complete the job with output variables
      return await job.complete({
        transactionId,
        status: 'success',
      });
    } catch (error) {
      // Fail the job on error
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      return await job.fail(errorMessage);
    }
  }

  private async processPayment(amount: number, currency: string, recipient: string): Promise<string> {
    // Your payment processing logic here
    return `txn-${Date.now()}`;
  }
}
```

### 4. Register Workers in Module

Add your worker handlers as providers:

```typescript
@Module({
  imports: [
    CamundaModule.forRoot({
      /* ... */
    }),
    CamundaModule.forFeature({
      workflowName: 'order-workflow',
      bpmn: './assets/order.bpmn',
      forms: [],
    }),
  ],
  providers: [
    PaymentHandler, // Your worker handlers
    // ... other workers
  ],
})
export class AppModule {}
```

Workers are automatically discovered and registered when the module initializes!

## API Reference

### `CamundaModule.forRoot(options)`

Configure the Camunda8 client connection. Call this once in your root module.

**Options:**

- `authStrategy`: `'OAUTH' | 'BASIC' | 'BEARER' | 'COOKIE' | 'NONE'`
- `zeebeGrpcAddress`: Zeebe gRPC address (e.g., `'grpc://localhost:26500'`)
- `zeebeRestAddress`: Zeebe REST address (e.g., `'http://localhost:8088'`)
- `clientId`: OAuth client ID
- `clientSecret`: OAuth client secret
- `oauthUrl`: OAuth token URL
- `tokenCacheDir?`: Optional token cache directory
- `tokenDiskCacheDisable?`: Optional flag to disable token disk cache

### `CamundaModule.forFeature(options)`

Register a workflow with its BPMN file and workers. Can be called multiple times for different workflows.

**Options:**

- `workflowName`: Unique workflow name to identify this workflow
- `bpmn`: Path to the BPMN file to deploy
- `forms`: Array of form file paths (can be empty array `[]`)

### `@WorkerJob(jobType, workflowName)`

Class decorator to mark a class as a Camunda8 worker handler.

**Parameters:**

- `jobType`: The job type this handler processes (must match the task type in your BPMN)
- `workflowName`: The workflow name this job belongs to (must match `forFeature` workflow name)

### `Camunda8WorkerHandler<TInput, TOutput, TCustomHeaders>`

Abstract base class that all worker handlers must extend.

**Methods:**

- `handle(job)`: Abstract method you must implement. Should return `job.complete()` or `job.fail()`

## Advanced Usage

### Async Configuration

Use `forRootAsync()` and `forFeatureAsync()` for async configuration:

```typescript
CamundaModule.forRootAsync({
  useFactory: (config: ConfigService) => ({
    authStrategy: 'OAUTH',
    zeebeGrpcAddress: config.get('ZEEBE_GRPC_ADDRESS'),
    // ... other options
  }),
  inject: [ConfigService],
}),

CamundaModule.forFeatureAsync({
  useFactory: (config: ConfigService) => ({
    workflowName: 'order-workflow',
    bpmn: config.get('ORDER_BPMN_PATH'),
    forms: [],
  }),
  inject: [ConfigService],
}),
```

### Multiple Workflows

You can register multiple workflows in the same application:

```typescript
@Module({
  imports: [
    CamundaModule.forRoot({
      /* ... */
    }),
    CamundaModule.forFeature({
      workflowName: 'order-workflow',
      bpmn: './assets/order.bpmn',
      forms: [],
    }),
    CamundaModule.forFeature({
      workflowName: 'invoice-workflow',
      bpmn: './assets/invoice.bpmn',
      forms: ['./assets/invoice.form'],
    }),
  ],
  providers: [
    // Order workflow workers
    OrderPaymentHandler,
    OrderShippingHandler,
    // Invoice workflow workers
    InvoiceGenerationHandler,
    InvoiceEmailHandler,
  ],
})
export class AppModule {}
```

### Using CamundaClientService

Inject `CamundaClientService` to start process instances programmatically:

```typescript
import { Injectable } from '@nestjs/common';
import { CamundaClientService } from 'camunda-nestjs';

@Injectable()
export class OrderService {
  constructor(private readonly camundaClient: CamundaClientService) {}

  async startOrderProcess(orderData: any) {
    return await this.camundaClient.createProcessInstance({
      processDefinitionId: 'process1',
      variables: orderData,
    });
  }
}
```

## How It Works

1. **Client Configuration**: `forRoot()` configures the Camunda8 SDK client connection
2. **Workflow Registration**: `forFeature()` registers a workflow and deploys BPMN/form files
3. **Worker Discovery**: The module automatically discovers all classes decorated with `@WorkerJob()`
4. **Worker Registration**: Workers are registered with Zeebe, filtered by workflow name
5. **Job Processing**: When jobs arrive, the corresponding worker handler processes them

## Type Safety

The library provides full TypeScript support:

```typescript
interface MyInput extends IInputVariables {
  userId: string;
  amount: number;
}

interface MyOutput extends IOutputVariables {
  result: string;
  processed: boolean;
}

@WorkerJob('my-task', 'my-workflow')
@Injectable()
export class MyHandler extends Camunda8WorkerHandler<MyInput, MyOutput> {
  async handle(job: Readonly<ZeebeJob<MyInput, ICustomHeaders, MyOutput>>) {
    // job.variables is typed as MyInput
    // Return type is checked as MyOutput
    return await job.complete({ result: 'done', processed: true });
  }
}
```

## Examples

See the `examples/` directory in the source code for more complete examples.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on GitHub.
