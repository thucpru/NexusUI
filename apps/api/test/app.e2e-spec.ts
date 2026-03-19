/**
 * App E2E tests — basic smoke tests for the NestJS API.
 * Tests health endpoint and basic 404 handling.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app-module';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception-filter';
import { LoggingInterceptor } from '../src/common/interceptors/logging-interceptor';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication({ rawBody: true });
    app.setGlobalPrefix('api/v1', { exclude: ['health'] });
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalInterceptors(new LoggingInterceptor());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /health', () => {
    it('returns 200 with status info', async () => {
      const res = await request(app.getHttpServer()).get('/health').expect(200);
      expect(res.body).toMatchObject({
        status: expect.any(String),
        uptime: expect.any(Number),
        database: expect.any(String),
        redis: expect.any(String),
        timestamp: expect.any(String),
      });
    });
  });

  describe('GET /api/v1/unknown', () => {
    it('returns 404 for unknown routes', async () => {
      await request(app.getHttpServer()).get('/api/v1/unknown-route').expect(404);
    });
  });

  describe('GET /api/v1/users/me (unauthenticated)', () => {
    it('returns 401 without auth token', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .expect(401);
      expect(res.body).toMatchObject({
        success: false,
        statusCode: 401,
      });
    });
  });

  describe('GET /api/v1/projects (unauthenticated)', () => {
    it('returns 401 without auth token', async () => {
      await request(app.getHttpServer()).get('/api/v1/projects').expect(401);
    });
  });
});
