/**
 * @Roles(...roles) — metadata decorator for role-based access control.
 * Used with AdminRoleGuard via SetMetadata.
 */
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
