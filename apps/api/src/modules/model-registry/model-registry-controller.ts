/**
 * ModelRegistryController
 *   GET  /models                — list active models (auth users)
 *   GET  /admin/models          — list all models incl. inactive (ADMIN)
 *   POST /admin/models          — create model (ADMIN)
 *   PATCH /admin/models/:id     — update model (ADMIN)
 *   DELETE /admin/models/:id    — soft delete / deactivate (ADMIN)
 */
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth-guard';
import { AdminRoleGuard } from '../../common/guards/admin-role-guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation-pipe';
import { ModelRegistryService } from './model-registry-service';
import { CreateModelSchema, type CreateModelInput } from './dto/create-model-dto';
import { UpdateModelSchema, type UpdateModelInput } from './dto/update-model-dto';
import type { ApiResponse } from '@nexusui/shared';
import type { AdminModelView, PublicModelView } from './model-registry-service';

@Controller()
export class ModelRegistryController {
  constructor(private readonly modelService: ModelRegistryService) {}

  /** List active models — available to all authenticated users */
  @UseGuards(ClerkAuthGuard)
  @Get('models')
  async listActiveModels(): Promise<ApiResponse<PublicModelView[]>> {
    const models = await this.modelService.listActiveModels();
    return { success: true, data: models };
  }

  /** List ALL models including inactive — admin only */
  @UseGuards(ClerkAuthGuard, AdminRoleGuard)
  @Get('admin/models')
  async listAllModels(): Promise<ApiResponse<AdminModelView[]>> {
    const models = await this.modelService.listAllModels();
    return { success: true, data: models };
  }

  /** Create new AI model — admin only */
  @UseGuards(ClerkAuthGuard, AdminRoleGuard)
  @Post('admin/models')
  @HttpCode(HttpStatus.CREATED)
  async createModel(
    @Body(new ZodValidationPipe(CreateModelSchema)) body: CreateModelInput,
  ): Promise<ApiResponse<AdminModelView>> {
    const model = await this.modelService.createModel(body);
    return { success: true, data: model, message: 'Model created' };
  }

  /** Update AI model — admin only */
  @UseGuards(ClerkAuthGuard, AdminRoleGuard)
  @Patch('admin/models/:id')
  async updateModel(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateModelSchema)) body: UpdateModelInput,
  ): Promise<ApiResponse<AdminModelView>> {
    const model = await this.modelService.updateModel(id, body);
    return { success: true, data: model };
  }

  /** Soft delete (deactivate) model — admin only */
  @UseGuards(ClerkAuthGuard, AdminRoleGuard)
  @Delete('admin/models/:id')
  @HttpCode(HttpStatus.OK)
  async deactivateModel(
    @Param('id') id: string,
  ): Promise<ApiResponse<AdminModelView>> {
    const model = await this.modelService.deactivateModel(id);
    return { success: true, data: model, message: 'Model deactivated' };
  }
}
