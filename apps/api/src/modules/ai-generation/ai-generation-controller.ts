/**
 * AiGenerationController
 *   POST /generate                       — start generation (auth)
 *   GET  /generate/:id                   — poll status (auth)
 *   GET  /generate/project/:projectId    — list project generations (auth)
 */
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth-guard';
import { CurrentUser } from '../../common/decorators/current-user-decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation-pipe';
import { AiGenerationService } from './ai-generation-service';
import { CreateGenerationSchema, type CreateGenerationInput } from './dto/create-generation-dto';
import type { GenerationResponseDto } from './dto/generation-response-dto';
import type { ApiResponse } from '@nexusui/shared';
import type { AuthenticatedUser } from '../../common/guards/clerk-auth-guard';

@UseGuards(ClerkAuthGuard)
@Controller('generate')
export class AiGenerationController {
  constructor(private readonly generationService: AiGenerationService) {}

  /** Start a new AI generation job */
  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  async createGeneration(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(CreateGenerationSchema)) body: CreateGenerationInput,
  ): Promise<ApiResponse<GenerationResponseDto>> {
    const generation = await this.generationService.createGeneration(user.id, body);
    return { success: true, data: generation, message: 'Generation queued' };
  }

  /** List generations for a project */
  @Get('project/:projectId')
  async listProjectGenerations(
    @Param('projectId') projectId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ApiResponse<GenerationResponseDto[]>> {
    const generations = await this.generationService.listProjectGenerations(projectId, user.id);
    return { success: true, data: generations };
  }

  /** Poll generation status by ID — must be placed AFTER static routes */
  @Get(':id')
  async getGeneration(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ApiResponse<GenerationResponseDto>> {
    const generation = await this.generationService.getGeneration(id, user.id);
    return { success: true, data: generation };
  }
}
