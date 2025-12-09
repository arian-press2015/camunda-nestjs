import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('order')
  async startOrder(
    @Body()
    orderData: {
      orderId?: string;
      items: Array<{ productId: string; quantity: number }>;
      amount: number;
      paymentMethod: string;
      address: string;
    },
  ) {
    const orderId = orderData.orderId || `order-${Date.now()}`;
    return await this.appService.startOrderProcess({
      ...orderData,
      orderId,
    });
  }
}
