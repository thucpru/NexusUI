/**
 * GlobalExceptionFilter — catches all exceptions and maps them to
 * a consistent { success, error, code, details, statusCode } shape.
 */
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

interface ErrorBody {
  success: false;
  error: string;
  code: string;
  details?: unknown;
  statusCode: number;
  path: string;
  timestamp: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { statusCode, message, code, details } = this.resolveException(exception);

    const body: ErrorBody = {
      success: false,
      error: message,
      code,
      details,
      statusCode,
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    // Log 5xx errors — skip expected 4xx noise
    if (statusCode >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} → ${statusCode}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(`[${request.method}] ${request.url} → ${statusCode}: ${message}`);
    }

    response.status(statusCode).json(body);
  }

  private resolveException(exception: unknown): {
    statusCode: number;
    message: string;
    code: string;
    details?: unknown;
  } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      const message =
        typeof res === 'string' ? res : (res as Record<string, unknown>)['message'] as string || exception.message;
      const details =
        typeof res === 'object' ? (res as Record<string, unknown>)['message'] : undefined;
      return {
        statusCode: status,
        message: Array.isArray(message) ? message.join(', ') : String(message),
        code: `HTTP_${status}`,
        details: Array.isArray(details) ? details : undefined,
      };
    }

    if (exception instanceof Error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
    };
  }
}
