import { z } from 'zod';
const ColorTokenSchema = z.object({
    name: z.string().min(1),
    value: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/),
    darkValue: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/).optional(),
    description: z.string().optional(),
});
const TypographyTokenSchema = z.object({
    name: z.string().min(1),
    fontFamily: z.string().min(1),
    fontSize: z.number().positive(),
    fontWeight: z.number().int().min(100).max(900),
    lineHeight: z.number().positive(),
    letterSpacing: z.number().optional(),
    description: z.string().optional(),
});
const SpacingTokenSchema = z.object({
    name: z.string().min(1),
    value: z.number().min(0),
    description: z.string().optional(),
});
const DesignSystemTokenSetSchema = z.object({
    colors: z.array(ColorTokenSchema),
    typography: z.array(TypographyTokenSchema),
    spacing: z.array(SpacingTokenSchema),
});
export const CreateDesignSystemSchema = z.object({
    projectId: z.string().uuid(),
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    tokens: DesignSystemTokenSetSchema,
    version: z.string().default('1.0.0'),
});
export const UpdateDesignSystemSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    tokens: DesignSystemTokenSetSchema.partial().optional(),
    version: z.string().optional(),
});
//# sourceMappingURL=design-system-validators.js.map