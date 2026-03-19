/**
 * AdminUserController — admin endpoints for user management.
 *   GET  /admin/users              — paginated list of all users
 *   PATCH /admin/users/:id/credits — adjust credit balance
 *
 * Requires ClerkAuthGuard + AdminRoleGuard.
 */
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth-guard';
import { AdminRoleGuard } from '../../common/guards/admin-role-guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation-pipe';
import { UserService } from './user-service';
import { AdminCreditAdjustmentSchema, type AdminCreditAdjustmentInput } from '@nexusui/shared';
import type { ApiResponse, PaginatedResponse } from '@nexusui/shared';
import type { User } from '@nexusui/database';
import { z } from 'zod';

const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

@UseGuards(ClerkAuthGuard, AdminRoleGuard)
@Controller('admin/users')
export class AdminUserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async listUsers(
    @Query(new ZodValidationPipe(PaginationSchema)) query: { page: number; limit: number },
  ): Promise<PaginatedResponse<User>> {
    const { users, total } = await this.userService.listUsers(query.page, query.limit);
    const hasMore = query.page * query.limit < total;

    return {
      success: true,
      data: users,
      pagination: {
        total,
        limit: query.limit,
        nextCursor: hasMore ? String(query.page + 1) : null,
        prevCursor: query.page > 1 ? String(query.page - 1) : null,
        hasMore,
      },
    };
  }

  @Patch(':id/credits')
  async adjustCredits(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(AdminCreditAdjustmentSchema)) body: AdminCreditAdjustmentInput,
  ): Promise<ApiResponse<User>> {
    // Ensure the route param userId matches body userId
    const updated = await this.userService.adjustCredits({ ...body, userId: id });
    return { success: true, data: updated };
  }
}
