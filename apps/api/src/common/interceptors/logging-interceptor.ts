/**
 * LoggingInterceptor — logs each request with method, URL, status, and duration.
 * Output is structured JSON for log aggregation.
 */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          this.logger.log(
            JSON.stringify({
              method: request.method,
              url: request.url,
              statusCode: response.statusCode,
              durationMs: duration,
            }),
          );
        },
        error: () => {
          const duration = Date.now() - startTime;
          this.logger.warn(
            JSON.stringify({
              method: request.method,
              url: request.url,
              durationMs: duration,
              error: true,
            }),
          );
        },
      }),
    );
  }
}
