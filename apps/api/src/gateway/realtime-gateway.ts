/**
 * RealtimeGateway — Socket.IO gateway for real-time events.
 *
 * Authentication: verifies Clerk JWT on connection.
 * Rooms:
 *   - project:{id}    — generation/sync status updates
 *   - user:{userId}   — credit balance updates
 *
 * Emitted events: generation:status, sync:status, credits:updated
 */
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';
import { verifyToken } from '@clerk/backend';
import { prisma } from '@nexusui/database';

export interface GenerationStatusPayload {
  generationId: string;
  projectId: string;
  status: string;
  progress?: number;
  outputUrl?: string;
}

export interface SyncStatusPayload {
  projectId: string;
  status: string;
  message?: string;
}

export interface CreditsUpdatedPayload {
  userId: string;
  newBalance: number;
  delta: number;
}

interface SocketWithUser extends Socket {
  userId: string;
  userDbId: string;
}

@WebSocketGateway({
  cors: { origin: '*' }, // Figma plugin iframe null-origin compatibility
  namespace: '/realtime',
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private readonly server!: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(private readonly config: ConfigService) {}

  /** Authenticate on connection — disconnect if JWT invalid */
  async handleConnection(client: Socket): Promise<void> {
    try {
      const token = this.extractToken(client);
      if (!token) throw new Error('Missing token');

      const clerkSecretKey = this.config.get<string>('CLERK_SECRET_KEY');
      if (!clerkSecretKey) throw new Error('Auth misconfigured');

      const payload = await verifyToken(token, { secretKey: clerkSecretKey });

      const dbUser = await prisma.user.findUnique({ where: { clerkId: payload.sub } });
      if (!dbUser) throw new Error('User not found');

      // Attach user info and join personal room
      (client as SocketWithUser).userId = payload.sub;
      (client as SocketWithUser).userDbId = dbUser.id;

      await client.join(`user:${dbUser.id}`);
      this.logger.log(`Client connected: ${client.id} (user: ${dbUser.id})`);
    } catch (err) {
      this.logger.warn(`Connection rejected: ${client.id} — ${(err as Error).message}`);
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /** Join a project room to receive generation/sync updates */
  @SubscribeMessage('join:project')
  async handleJoinProject(
    @ConnectedSocket() client: SocketWithUser,
    @MessageBody() data: { projectId: string },
  ): Promise<void> {
    if (!data?.projectId) throw new WsException('projectId required');

    // Verify user owns the project
    const project = await prisma.project.findFirst({
      where: { id: data.projectId, userId: client.userDbId },
    });
    if (!project) throw new WsException('Project not found or access denied');

    await client.join(`project:${data.projectId}`);
    client.emit('joined:project', { projectId: data.projectId });
    this.logger.debug(`${client.id} joined project:${data.projectId}`);
  }

  /** Leave a project room */
  @SubscribeMessage('leave:project')
  async handleLeaveProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { projectId: string },
  ): Promise<void> {
    if (!data?.projectId) return;
    await client.leave(`project:${data.projectId}`);
    client.emit('left:project', { projectId: data.projectId });
  }

  // ─── Server-side emit helpers (called by other services) ────────────────────

  /** Broadcast generation status to project room */
  emitGenerationStatus(payload: GenerationStatusPayload): void {
    this.server
      .to(`project:${payload.projectId}`)
      .emit('generation:status', payload);
  }

  /** Broadcast sync status to project room */
  emitSyncStatus(payload: SyncStatusPayload): void {
    this.server.to(`project:${payload.projectId}`).emit('sync:status', payload);
  }

  /** Notify a specific user of their updated credit balance */
  emitCreditsUpdated(payload: CreditsUpdatedPayload): void {
    this.server.to(`user:${payload.userId}`).emit('credits:updated', payload);
  }

  private extractToken(client: Socket): string | undefined {
    // Check handshake auth first, then query param
    const authToken = (client.handshake.auth as Record<string, string>)?.token;
    if (authToken) return authToken;
    const queryToken = client.handshake.query?.token;
    return typeof queryToken === 'string' ? queryToken : undefined;
  }
}
