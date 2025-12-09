/**
 * Example of a Camunda8 worker handler using the base class approach.
 * This file is for documentation purposes only.
 */

import { Injectable } from '@nestjs/common';
import { WorkerJob, Camunda8WorkerHandler } from '../index';
import type {
  ZeebeJob,
  IInputVariables,
  IOutputVariables,
  ICustomHeaders,
  JOB_ACTION_ACKNOWLEDGEMENT,
} from '@camunda8/sdk/dist/zeebe/lib/interfaces-1.0';

// Example: Define custom input/output types
interface PaymentInput extends IInputVariables {
  amount: number;
  currency: string;
  recipient: string;
}

interface PaymentOutput extends IOutputVariables {
  transactionId: string;
  status: 'success' | 'failed';
}

/**
 * Example worker handler that processes payment jobs.
 * The class must:
 * 1. Be decorated with @WorkerJob('job-type')
 * 2. Extend Camunda8WorkerHandler base class
 * 3. Implement the handle() method that returns job.complete() or job.fail()
 */
@WorkerJob('payment-processing', 'order-workflow')
@Injectable()
export class PaymentHandler extends Camunda8WorkerHandler<
  PaymentInput,
  PaymentOutput
> {
  async handle(
    job: Readonly<ZeebeJob<PaymentInput, ICustomHeaders, PaymentOutput>>,
  ): Promise<typeof JOB_ACTION_ACKNOWLEDGEMENT> {
    try {
      const { amount, currency, recipient } = job.variables;

      // Process payment logic here
      const transactionId = await this.processPayment(
        amount,
        currency,
        recipient,
      );

      // Must return the result of job.complete() or job.fail()
      return await job.complete({
        transactionId,
        status: 'success',
      });
    } catch (error) {
      // Handle errors by calling job.fail()
      const errorMessage =
        error instanceof Error ? error.message : 'Payment processing failed';
      return await job.fail(errorMessage);
    }
  }

  private async processPayment(
    amount: number,
    currency: string,
    recipient: string,
  ): Promise<string> {
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return `txn-${Date.now()}-${amount}-${currency}-${recipient}`;
  }
}
