import { z } from 'zod';
import { ProjectStatus } from '../types/project-types';
export const ProjectStatusSchema = z.nativeEnum(ProjectStatus);
export const CreateProjectSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    figmaFileKey: z.string().optional(),
});
export const UpdateProjectSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    status: ProjectStatusSchema.optional(),
    figmaFileKey: z.string().optional(),
});
export const ProjectIdSchema = z.object({
    id: z.string().uuid(),
});
//# sourceMappingURL=project-validators.js.map