/**
 * DatabaseModule — provides the Prisma client as an injectable service.
 * Wraps @nexusui/database singleton for NestJS DI.
 */
import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database-service';

@Global()
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
