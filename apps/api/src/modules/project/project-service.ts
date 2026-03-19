/**
 * ProjectService — CRUD operations for projects, always scoped to the owning user.
 */
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database-service';
import type { CreateProjectInput, UpdateProjectInput } from '@nexusui/shared';
import { ProjectStatus } from '@nexusui/database';
import type { Project } from '@nexusui/database';

@Injectable()
export class ProjectService {
  constructor(private readonly db: DatabaseService) {}

  /** List all active projects for a user (excludes ARCHIVED) */
  async listProjects(userId: string): Promise<Project[]> {
    return this.db.client.project.findMany({
      where: { userId, status: { not: ProjectStatus.ARCHIVED } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /** Get a single project — verifies ownership */
  async getProject(id: string, userId: string): Promise<Project> {
    const project = await this.db.client.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    if (project.userId !== userId) throw new ForbiddenException('Access denied');
    return project;
  }

  /** Create a new project for the authenticated user */
  async createProject(userId: string, input: CreateProjectInput): Promise<Project> {
    return this.db.client.project.create({
      data: {
        userId,
        name: input.name,
        description: input.description ?? null,
        // Map figmaFileKey from shared schema → figmaFileId in DB schema
        figmaFileId: input.figmaFileKey ?? null,
        status: ProjectStatus.ACTIVE,
      },
    });
  }

  /** Update a project — verifies ownership before updating */
  async updateProject(id: string, userId: string, input: UpdateProjectInput): Promise<Project> {
    await this.getProject(id, userId); // Ownership check

    // Build update data, mapping optional fields to null explicitly (Prisma exactOptionalPropertyTypes)
    const data: Record<string, unknown> = {};
    if (input.name !== undefined) data['name'] = input.name;
    if (input.description !== undefined) data['description'] = input.description;
    if (input.status !== undefined) data['status'] = input.status;
    if (input.figmaFileKey !== undefined) data['figmaFileId'] = input.figmaFileKey;

    return this.db.client.project.update({ where: { id }, data });
  }

  /** Soft-delete by setting status to ARCHIVED */
  async archiveProject(id: string, userId: string): Promise<Project> {
    await this.getProject(id, userId); // Ownership check
    return this.db.client.project.update({
      where: { id },
      data: { status: ProjectStatus.ARCHIVED },
    });
  }
}
