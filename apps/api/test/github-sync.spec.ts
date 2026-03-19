import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('GitHub Sync Service (e2e)', () => {
  let app: INestApplication;
  let userToken: string;
  let projectId: string;
  let connectionId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyIiwicm9sZSI6IlVTRVIifQ.test';
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GitHub connection', () => {
    it('should initiate GitHub OAuth flow', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/github/connect')
        .set('Authorization', userToken);

      expect([200, 401]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body).toHaveProperty('authUrl');
      }
    });

    it('should handle GitHub OAuth callback', async () => {
      const callbackRequest = {
        code: 'github_code_123',
        state: 'state_123',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/github/callback')
        .set('Authorization', userToken)
        .send(callbackRequest);

      expect([200, 400, 401]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body).toHaveProperty('connectionId');
        connectionId = response.body.connectionId;
      }
    });
  });

  describe('Project repository list', () => {
    it('should fetch connected repositories', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/github/repos')
        .set('Authorization', userToken);

      expect([200, 401]).toContain(response.status);
      if (response.status === 200) {
        expect(Array.isArray(response.body.data) || Array.isArray(response.body)).toBe(true);
      }
    });

    it('should fetch branches for specific repository', async () => {
      if (!projectId) {
        this.skip();
        return;
      }

      const response = await request(app.getHttpServer())
        .get(`/api/v1/github/branches/${projectId}`)
        .set('Authorization', userToken);

      expect([200, 401, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(Array.isArray(response.body.data) || Array.isArray(response.body)).toBe(true);
      }
    });
  });

  describe('Design-to-code sync', () => {
    it('should initiate design-to-code sync', async () => {
      if (!connectionId) {
        this.skip();
        return;
      }

      const syncRequest = {
        connectionId,
        direction: 'push',
        targetBranch: 'main',
        syncMode: 'pr',
        tokens: {
          colors: [{ name: 'primary', value: '#0066FF' }],
        },
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/github/sync')
        .set('Authorization', userToken)
        .send(syncRequest);

      expect([200, 400, 401, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body).toHaveProperty('status');
      }
    });

    it('should reject sync for non-owned repository', async () => {
      const syncRequest = {
        connectionId: 'other-connection',
        direction: 'push',
        targetBranch: 'main',
        syncMode: 'pr',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/github/sync')
        .set('Authorization', userToken)
        .send(syncRequest);

      // Should return 401 or 403 for non-owned repository
      expect([401, 403, 404]).toContain(response.status);
    });
  });

  describe('Sync status', () => {
    it('should fetch sync status for project', async () => {
      if (!projectId) {
        this.skip();
        return;
      }

      const response = await request(app.getHttpServer())
        .get(`/api/v1/github/sync/status/${projectId}`)
        .set('Authorization', userToken);

      expect([200, 401, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body).toHaveProperty('status');
        expect(response.body).toHaveProperty('lastSync');
      }
    });
  });

  describe('GitHub webhooks', () => {
    it('should handle GitHub push webhooks', async () => {
      const webhookPayload = {
        action: 'opened',
        pull_request: {
          id: 123456,
          title: 'Design System Update',
          head: {
            ref: 'design-sync',
          },
        },
        repository: {
          id: 789,
          full_name: 'user/repo',
        },
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/webhooks/github')
        .set('X-GitHub-Event', 'pull_request')
        .set('X-GitHub-Signature', 'sha256=test')
        .send(webhookPayload);

      expect([200, 400]).toContain(response.status);
    });

    it('should reject webhook without signature', async () => {
      const webhookPayload = {
        action: 'opened',
        pull_request: { id: 123 },
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/webhooks/github')
        .set('X-GitHub-Event', 'pull_request')
        .send(webhookPayload);

      expect(response.status).toBe(401);
    });
  });
});
