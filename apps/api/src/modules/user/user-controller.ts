/**
 * UserController — current user profile endpoints.
 *   GET  /users/me         — profile + credit balance
 *   PATCH /users/me        — update profile
 */
import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth-guard';
import { CurrentUser } from '../../common/decorators/current-user-decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation-pipe';
import { UserService } from './user-service';
import { UpdateUserSchema, type UpdateUserInput } from '@nexusui/shared';
import type { AuthenticatedUser } from '../../common/guards/clerk-auth-guard';
import type { ApiResponse } from '@nexusui/shared';
import type { User } from '@nexusui/database';

@UseGuards(ClerkAuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async getMe(@CurrentUser() user: AuthenticatedUser): Promise<ApiResponse<User>> {
    const profile = await this.userService.getUserById(user.id);
    return { success: true, data: profile };
  }

  @Patch('me')
  async updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(UpdateUserSchema)) body: UpdateUserInput,
  ): Promise<ApiResponse<User>> {
    const updated = await this.userService.updateUser(user.id, body);
    return { success: true, data: updated };
  }
}
