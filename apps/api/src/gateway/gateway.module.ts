/**
 * GatewayModule — provides RealtimeGateway as a globally-available NestJS provider.
 * Import this module wherever Socket.IO emissions are needed.
 */
import { Global, Module } from '@nestjs/common';
import { RealtimeGateway } from './realtime-gateway';

@Global()
@Module({
  providers: [RealtimeGateway],
  exports: [RealtimeGateway],
})
export class GatewayModule {}
