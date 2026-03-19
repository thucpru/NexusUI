/**
 * ClerkAuthGuard — verifies Clerk JWT from Authorization: Bearer <token>.
 * Attaches { userId, clerkId, role } to request.user on success.
 */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verifyToken } from '@clerk/backend';
import type { Request } from 'express';
import { prisma } from '@nexusui/database';

export interface AuthenticatedUser {
  id: string;
  clerkId: string;
  role: string;
}

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing authorization token');
    }

    try {
      const clerkSecretKey = this.config.get<string>('CLERK_SECRET_KEY');
      if (!clerkSecretKey) {
        throw new UnauthorizedException('Auth service misconfigured');
      }

      const payload = await verifyToken(token, { secretKey: clerkSecretKey });

      const clerkId = payload.sub;
      const dbUser = await prisma.user.findUnique({ where: { clerkId } });
      if (!dbUser) {
        throw new UnauthorizedException('User not found');
      }

      // Attach to request for downstream use
      (request as Request & { user: AuthenticatedUser }).user = {
        id: dbUser.id,
        clerkId: dbUser.clerkId,
        role: dbUser.role,
      };
      return true;
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractToken(request: Request): string | undefined {
    const authHeader = request.headers['authorization'];
    if (!authHeader?.startsWith('Bearer ')) return undefined;
    return authHeader.slice(7);
  }
}
