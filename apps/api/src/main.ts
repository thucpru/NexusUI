/**
 * NexusUI API — NestJS bootstrap.
 *
 * CORS: wildcard origin for Figma plugin iframe (null origin) compatibility.
 * JWT auth via @clerk/backend — no CSRF risk, wildcard CORS is safe.
 */
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app-module';
import { GlobalExceptionFilter } from './common/filters/global-exception-filter';
import { LoggingInterceptor } from './common/interceptors/logging-interceptor';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Required for svix webhook signature verification
    logger: ['log', 'warn', 'error', 'debug'],
  });

  // CORS: allow all origins for Figma plugin iframe (null origin)
  app.enableCors({
    origin: '*',
    methods: ['GET', 'HEAD', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: false, // Must be false when origin is *
  });

  // Global API prefix
  app.setGlobalPrefix('api/v1', {
    exclude: ['health'], // Health check at root level /health
  });

  // Global validation pipe — activates class-validator DTOs on all endpoints
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  // Global exception filter — consistent error shape
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global logging interceptor — request/response timing
  app.useGlobalInterceptors(new LoggingInterceptor());

  const port = process.env['PORT'] ?? 4000;
  await app.listen(port);

  logger.log(`NexusUI API listening on http://localhost:${port}`);
  logger.log(`API prefix: /api/v1`);
}

bootstrap().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
