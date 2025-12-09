import { Injectable } from '@nestjs/common';
import { CamundaClientService } from './camunda/services/camunda-client.service';

@Injectable()
export class AppService {
  constructor(private readonly CamundaClientService: CamundaClientService) {}

  getHello(): string {
    return 'Hello World!';
  }

  /**
   * Start a new order process instance
   */
  async startOrderProcess(orderData: {
    orderId: string;
    items: Array<{ productId: string; quantity: number }>;
    amount: number;
    paymentMethod: string;
    address: string;
  }) {
    try {
      const result = await this.CamundaClientService.createProcessInstance({
        processDefinitionId: 'process1', // From the BPMN file
        variables: {
          orderId: orderData.orderId,
          items: orderData.items,
          amount: orderData.amount,
          paymentMethod: orderData.paymentMethod,
          address: orderData.address,
        },
      });

      return {
        success: true,
        processInstanceKey: result.processInstanceKey,
        message: 'Order process started successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
