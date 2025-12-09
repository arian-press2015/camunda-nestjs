import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CamundaModule } from './camunda/camunda.module';
import { CheckInventoryWorker } from './workers/check-inventory.worker';
import { ChargePaymentWorker } from './workers/charge-payment.worker';
import { ShipItemsWorker } from './workers/ship-items.worker';

@Module({
  imports: [
    CamundaModule.forRoot({
      client: {
        authStrategy: 'OAUTH',
        zeebeGrpcAddress: 'grpc://localhost:26500',
        zeebeRestAddress: 'http://localhost:8088',
        clientId: 'orchestration',
        clientSecret: 'secret',
        oauthUrl:
          'http://localhost:18080/auth/realms/camunda-platform/protocol/openid-connect/token',
      },
      workflow: {
        bpmn: './assets/order.bpmn',
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    CheckInventoryWorker,
    ChargePaymentWorker,
    ShipItemsWorker,
  ],
})
export class AppModule {}
