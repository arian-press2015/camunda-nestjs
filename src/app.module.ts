import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Camunda8Module } from './camunda8/camunda8.module';

@Module({
  imports: [
    Camunda8Module.forRoot({
      CAMUNDA_AUTH_STRATEGY: 'OAUTH',
      ZEEBE_GRPC_ADDRESS: 'grpc://localhost:26500',
      ZEEBE_REST_ADDRESS: 'http://localhost:8088',
      ZEEBE_CLIENT_ID: 'orchestration',
      ZEEBE_CLIENT_SECRET: 'secret',
      CAMUNDA_OAUTH_URL:
        'http://localhost:18080/auth/realms/camunda-platform/protocol/openid-connect/token',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
