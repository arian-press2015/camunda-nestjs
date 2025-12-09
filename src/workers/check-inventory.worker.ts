import { Injectable } from '@nestjs/common';
import { WorkerJob, Camunda8WorkerHandler } from '../camunda';
import type {
  ZeebeJob,
  IInputVariables,
  IOutputVariables,
} from '@camunda8/sdk/dist/zeebe/lib/interfaces-1.0';

interface CheckInventoryInput extends IInputVariables {
  orderId: string;
  items: Array<{ productId: string; quantity: number }>;
}

interface CheckInventoryOutput extends IOutputVariables {
  available: boolean;
}

@WorkerJob('check-inventory')
@Injectable()
export class CheckInventoryWorker extends Camunda8WorkerHandler<
  CheckInventoryInput,
  CheckInventoryOutput
> {
  async handle(
    job: Readonly<ZeebeJob<CheckInventoryInput, object, CheckInventoryOutput>>,
  ): Promise<'JOB_ACTION_ACKNOWLEDGEMENT'> {
    const { orderId, items } = job.variables;

    console.log(
      `[CheckInventory] Processing order ${orderId} with ${items.length} items`,
    );

    // Simulate inventory check
    const unavailableItems: string[] = [];
    for (const item of items) {
      // Simulate: productId starting with 'X' is unavailable
      if (item.productId.startsWith('X')) {
        unavailableItems.push(item.productId);
      }
    }

    const available = unavailableItems.length === 0;

    if (available) {
      console.log(`[CheckInventory] All items available for order ${orderId}`);
      return await job.complete({
        available: true,
      });
    } else {
      console.log(
        `[CheckInventory] Some items unavailable for order ${orderId}:`,
        unavailableItems,
      );
      return await job.fail(
        `Items unavailable: ${unavailableItems.join(', ')}`,
      );
    }
  }
}
