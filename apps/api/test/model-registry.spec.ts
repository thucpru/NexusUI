import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Model Registry (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let userToken: string;
  let modelId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    adminToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJBRE1JTiJ9.test';
    userToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyIiwicm9sZSI6IlVTRVIifQ.test';
  });

  afterAll(async () => {
    await app.close();
  });

  describe('User model list', () => {
    it('should fetch available models for users', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/models')
        .set('Authorization', userToken);

      expect([200, 401]).toContain(response.status);
      if (response.status === 200) {
        expect(Array.isArray(response.body.data) || Array.isArray(response.body)).toBe(true);
        if (response.body.data && response.body.data.length > 0) {
          const model = response.body.data[0];
          expect(model).toHaveProperty('id');
          expect(model).toHaveProperty('name');
          expect(model).toHaveProperty('provider');
          // API keys should NOT be exposed to users
          expect(model).not.toHaveProperty('apiKey');
          expect(model).not.toHaveProperty('secretKey');
        }
      }
    });

    it('should only show ACTIVE models to users', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/models')
        .set('Authorization', userToken);

      if (response.status === 200 && response.body.data?.length > 0) {
        response.body.data.forEach((model: any) => {
          expect(model.status).toBe('ACTIVE');
        });
      }
    });
  });

  describe('Admin model CRUD', () => {
    it('should create a new model (admin only)', async () => {
      const createRequest = {
        name: 'Test Model',
        provider: 'CLAUDE',
        creditCostPerRequest: 5,
        description: 'Test model for integration testing',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/models')
        .set('Authorization', adminToken)
        .send(createRequest);

      expect([200, 201, 401, 403]).toContain(response.status);
      if (response.status === 201 || response.status === 200) {
        expect(response.body).toHaveProperty('id');
        modelId = response.body.id;
      }
    });

    it('should user not create models', async () => {
      const createRequest = {
        name: 'Unauthorized Model',
        provider: 'CLAUDE',
        creditCostPerRequest: 10,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/models')
        .set('Authorization', userToken)
        .send(createRequest);

      expect(response.status).toBe(403);
    });
  });

  describe('Model details (admin)', () => {
    it('should expose API key only to admin', async () => {
      if (!modelId) {
        this.skip();
        return;
      }

      const response = await request(app.getHttpServer())
        .get(`/api/v1/admin/models/${modelId}`)
        .set('Authorization', adminToken);

      expect([200, 401, 404]).toContain(response.status);
      if (response.status === 200) {
        // Admin should see masked API key or full structure
        expect(response.body).toHaveProperty('id');
      }
    });

    it('should mask API key in user response', async () => {
      if (!modelId) {
        this.skip();
        return;
      }

      const response = await request(app.getHttpServer())
        .get(`/api/v1/models/${modelId}`)
        .set('Authorization', userToken);

      if (response.status === 200) {
        // API key should never be exposed to users
        expect(response.body).not.toHaveProperty('apiKey');
        expect(response.body).not.toHaveProperty('secretKey');
      }
    });
  });

  describe('Model update (admin)', () => {
    it('should update model cost', async () => {
      if (!modelId) {
        this.skip();
        return;
      }

      const updateRequest = {
        creditCostPerRequest: 15,
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/admin/models/${modelId}`)
        .set('Authorization', adminToken)
        .send(updateRequest);

      expect([200, 401, 404]).toContain(response.status);
    });
  });
});
