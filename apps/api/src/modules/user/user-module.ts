/**
 * UserModule — user profile, admin user management, and Clerk webhooks.
 */
import { Module } from '@nestjs/common';
import { UserController } from './user-controller';
import { AdminUserController } from './admin-user-controller';
import { UserWebhookController } from './user-webhook-controller';
import { UserService } from './user-service';
import { BillingModule } from '../billing/billing.module';

@Module({
  imports: [BillingModule],
  controllers: [UserController, AdminUserController, UserWebhookController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
