import { z } from 'zod';
import { UserRole } from '../types/user-types';
export const UserRoleSchema = z.nativeEnum(UserRole);
export const UserSchema = z.object({
    id: z.string().uuid(),
    clerkId: z.string().min(1),
    email: z.string().email(),
    name: z.string().min(1).max(255),
    avatarUrl: z.string().url().optional(),
    role: UserRoleSchema,
    creditBalance: z.number().int().min(0),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
});
export const UpdateUserSchema = z.object({
    name: z.string().min(1).max(255).optional(),
    avatarUrl: z.string().url().optional(),
});
export const UpdateUserRoleSchema = z.object({
    role: UserRoleSchema,
});
//# sourceMappingURL=user-validators.js.map