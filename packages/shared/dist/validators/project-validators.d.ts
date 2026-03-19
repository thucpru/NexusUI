import { z } from 'zod';
import { ProjectStatus } from '../types/project-types';
export declare const ProjectStatusSchema: z.ZodNativeEnum<typeof ProjectStatus>;
export declare const CreateProjectSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    figmaFileKey: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    description?: string | undefined;
    figmaFileKey?: string | undefined;
}, {
    name: string;
    description?: string | undefined;
    figmaFileKey?: string | undefined;
}>;
export declare const UpdateProjectSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodNativeEnum<typeof ProjectStatus>>;
    figmaFileKey: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    status?: ProjectStatus | undefined;
    description?: string | undefined;
    figmaFileKey?: string | undefined;
}, {
    name?: string | undefined;
    status?: ProjectStatus | undefined;
    description?: string | undefined;
    figmaFileKey?: string | undefined;
}>;
export declare const ProjectIdSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
//# sourceMappingURL=project-validators.d.ts.map