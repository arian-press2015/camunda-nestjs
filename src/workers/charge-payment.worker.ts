import { Injectable } from '@nestjs/common';
import { WorkerJob, Camunda8WorkerHandler } from '../camunda';
import type {
  ZeebeJob,
  IInputVariables,
  IOutputVariables,
  ICustomHeaders,
} from '@camunda8/sdk/dist/zeebe/lib/interfaces-1.0';

interface ChargePaymentInput extends IInputVariables {
  orderId: string;
  amount: number;
  paymentMethod: string;
}

interface ChargePaymentOutput extends IOutputVariables {
  transactionId: string;
  charged: boolean;
}

@WorkerJob('charge-payment', 'order-workflow')
@Injectable()
export class ChargePaymentWorker extends Camunda8WorkerHandler<
  ChargePaymentInput,
  ChargePaymentOutput
> {
  async handle(
    job: Readonly<
      ZeebeJob<ChargePaymentInput, ICustomHeaders, ChargePaymentOutput>
    >,
  ) {
    const { orderId, amount, paymentMethod } = job.variables;

    console.log(
      `[ChargePayment] Charging ${amount} for order ${orderId} using ${paymentMethod}`,
    );

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Simulate: amounts over 1000 fail
    if (amount > 1000) {
      console.log(
        `[ChargePayment] Payment failed for order ${orderId}: Amount too high`,
      );
      return await job.fail(`Payment failed: Amount ${amount} exceeds limit`);
    }

    const transactionId = `txn-${Date.now()}-${orderId}`;
    console.log(
      `[ChargePayment] Payment successful for order ${orderId}, transaction: ${transactionId}`,
    );

    return await job.complete({
      transactionId,
      charged: true,
    });
  }
}
