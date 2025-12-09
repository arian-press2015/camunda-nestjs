import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Camunda8Module } from './camunda8/camunda8.module';

@Module({
  imports: [
    Camunda8Module.forRoot({
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
        bpmn: './path/to/process.bpmn',
        form: './path/to/form.form',
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
