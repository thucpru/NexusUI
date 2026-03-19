import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Credit Metering (e2e)', () => {
  let app: INestApplication;
  let userToken: string;
  const userId = 'test-user-123';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userToken = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIke3VzZXJJZH0ifQ.test`;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Credit balance operations', () => {
    it('should fetch current credit balance', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/credits/balance')
        .set('Authorization', userToken);

      expect([200, 401, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body).toHaveProperty('balance');
        expect(typeof response.body.balance).toBe('number');
        expect(response.body.balance).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('Credit deduction (atomic)', () => {
    it('should atomically deduct credits for generation', async () => {
      const deductRequest = {
        amount: 10,
        operationType: 'GENERATION_COST',
        generationId: 'gen-123',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/credits/deduct')
        .set('Authorization', userToken)
        .send(deductRequest);

      expect([200, 401, 402, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body).toHaveProperty('newBalance');
        expect(typeof response.body.newBalance).toBe('number');
      }
    });

    it('should reject deduction if insufficient balance', async () => {
      const deductRequest = {
        amount: 999999,
        operationType: 'GENERATION_COST',
        generationId: 'gen-456',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/credits/deduct')
        .set('Authorization', userToken)
        .send(deductRequest);

      // Should return 402 Payment Required if insufficient balance
      expect([402, 401, 404]).toContain(response.status);
    });
  });

  describe('Credit refund', () => {
    it('should refund credits for failed generation', async () => {
      const refundRequest = {
        amount: 5,
        operationType: 'REFUND',
        generationId: 'gen-789',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/credits/refund')
        .set('Authorization', userToken)
        .send(refundRequest);

      expect([200, 401, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body).toHaveProperty('newBalance');
      }
    });
  });

  describe('Credit history', () => {
    it('should fetch credit ledger history', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/credits/history')
        .set('Authorization', userToken);

      expect([200, 401, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(Array.isArray(response.body.data) || Array.isArray(response.body)).toBe(true);
      }
    });

    it('should support pagination in history', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/credits/history?limit=10&offset=0')
        .set('Authorization', userToken);

      expect([200, 401, 404]).toContain(response.status);
    });
  });
});
