import { z } from 'zod';
import { UserRole } from '../types/user-types';
export declare const UserRoleSchema: z.ZodNativeEnum<typeof UserRole>;
export declare const UserSchema: z.ZodObject<{
    id: z.ZodString;
    clerkId: z.ZodString;
    email: z.ZodString;
    name: z.ZodString;
    avatarUrl: z.ZodOptional<z.ZodString>;
    role: z.ZodNativeEnum<typeof UserRole>;
    creditBalance: z.ZodNumber;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    clerkId: string;
    email: string;
    name: string;
    role: UserRole;
    creditBalance: number;
    createdAt: Date;
    updatedAt: Date;
    avatarUrl?: string | undefined;
}, {
    id: string;
    clerkId: string;
    email: string;
    name: string;
    role: UserRole;
    creditBalance: number;
    createdAt: Date;
    updatedAt: Date;
    avatarUrl?: string | undefined;
}>;
export declare const UpdateUserSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    avatarUrl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    avatarUrl?: string | undefined;
}, {
    name?: string | undefined;
    avatarUrl?: string | undefined;
}>;
export declare const UpdateUserRoleSchema: z.ZodObject<{
    role: z.ZodNativeEnum<typeof UserRole>;
}, "strip", z.ZodTypeAny, {
    role: UserRole;
}, {
    role: UserRole;
}>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type UpdateUserRoleInput = z.infer<typeof UpdateUserRoleSchema>;
//# sourceMappingURL=user-validators.d.ts.map