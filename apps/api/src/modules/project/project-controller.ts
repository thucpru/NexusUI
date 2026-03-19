/**
 * ProjectController — CRUD endpoints for projects, user-scoped.
 *   GET    /projects        — list user's projects
 *   GET    /projects/:id    — single project
 *   POST   /projects        — create project
 *   PATCH  /projects/:id    — update project
 *   DELETE /projects/:id    — soft delete (ARCHIVED)
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
import { CurrentUser } from '../../common/decorators/current-user-decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation-pipe';
import { ProjectService } from './project-service';
import {
  CreateProjectSchema,
  UpdateProjectSchema,
  type CreateProjectInput,
  type UpdateProjectInput,
} from '@nexusui/shared';
import type { ApiResponse } from '@nexusui/shared';
import type { AuthenticatedUser } from '../../common/guards/clerk-auth-guard';
import type { Project } from '@nexusui/database';

@UseGuards(ClerkAuthGuard)
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  async listProjects(@CurrentUser() user: AuthenticatedUser): Promise<ApiResponse<Project[]>> {
    const projects = await this.projectService.listProjects(user.id);
    return { success: true, data: projects };
  }

  @Get(':id')
  async getProject(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ApiResponse<Project>> {
    const project = await this.projectService.getProject(id, user.id);
    return { success: true, data: project };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createProject(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(CreateProjectSchema)) body: CreateProjectInput,
  ): Promise<ApiResponse<Project>> {
    const project = await this.projectService.createProject(user.id, body);
    return { success: true, data: project, message: 'Project created' };
  }

  @Patch(':id')
  async updateProject(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(UpdateProjectSchema)) body: UpdateProjectInput,
  ): Promise<ApiResponse<Project>> {
    const project = await this.projectService.updateProject(id, user.id, body);
    return { success: true, data: project };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteProject(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ApiResponse<Project>> {
    const project = await this.projectService.archiveProject(id, user.id);
    return { success: true, data: project, message: 'Project archived' };
  }
}
