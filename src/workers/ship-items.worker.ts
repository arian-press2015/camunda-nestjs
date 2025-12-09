import { Injectable } from '@nestjs/common';
import { WorkerJob, Camunda8WorkerHandler } from '../camunda';
import type {
  ZeebeJob,
  IInputVariables,
  IOutputVariables,
  ICustomHeaders,
} from '@camunda8/sdk/dist/zeebe/lib/interfaces-1.0';

interface ShipItemsInput extends IInputVariables {
  orderId: string;
  items: Array<{ productId: string; quantity: number }>;
  address: string;
}

interface ShipItemsOutput extends IOutputVariables {
  trackingNumber: string;
  shipped: boolean;
}

@WorkerJob('ship-items', 'order-workflow')
@Injectable()
export class ShipItemsWorker extends Camunda8WorkerHandler<
  ShipItemsInput,
  ShipItemsOutput
> {
  async handle(
    job: Readonly<ZeebeJob<ShipItemsInput, ICustomHeaders, ShipItemsOutput>>,
  ) {
    const { orderId, items, address } = job.variables;

    console.log(
      `[ShipItems] Shipping ${items.length} items for order ${orderId} to ${address}`,
    );

    // Simulate shipping
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const trackingNumber = `TRK-${Date.now()}-${orderId}`;
    console.log(
      `[ShipItems] Order ${orderId} shipped with tracking number: ${trackingNumber}`,
    );

    return await job.complete({
      trackingNumber,
      shipped: true,
    });
  }
}
