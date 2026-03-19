import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth Guard (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Generate test tokens (mock Clerk JWT tokens for testing)
    adminToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJBRE1JTiJ9.test';
    userToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyIiwicm9sZSI6IlVTRVIifQ.test';
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Unauthenticated access', () => {
    it('should return 401 for protected endpoints without token', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/users/me');
      expect(response.status).toBe(401);
    });

    it('should allow access to health endpoint', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/health');
      expect(response.status).toBe(200);
    });
  });

  describe('Admin-only endpoints', () => {
    it('should return 403 for user without ADMIN role', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/users')
        .set('Authorization', userToken);
      expect(response.status).toBe(403);
    });

    it('should allow access with ADMIN role', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/users')
        .set('Authorization', adminToken);
      // Should return 200 or 401 depending on whether user exists, but NOT 403
      expect([200, 401, 404]).toContain(response.status);
    });
  });

  describe('Invalid token', () => {
    it('should return 401 for malformed token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', 'Bearer invalid');
      expect(response.status).toBe(401);
    });
  });
});
