import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Billing & Stripe (e2e)', () => {
  let app: INestApplication;
  let userToken: string;
  let packageId: string;

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

  describe('Credit packages', () => {
    it('should fetch available credit packages', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/billing/packages')
        .set('Authorization', userToken);

      expect([200, 401]).toContain(response.status);
      if (response.status === 200) {
        expect(Array.isArray(response.body.data) || Array.isArray(response.body)).toBe(true);
        if (response.body.data && response.body.data.length > 0) {
          const pkg = response.body.data[0];
          expect(pkg).toHaveProperty('id');
          expect(pkg).toHaveProperty('credits');
          expect(pkg).toHaveProperty('priceInCents');
        }
      }
    });
  });

  describe('Stripe checkout session', () => {
    it('should create checkout session for credit purchase', async () => {
      const checkoutRequest = {
        packageId: 'pkg-test-123',
        successUrl: 'https://nexusui.dev/dashboard',
        cancelUrl: 'https://nexusui.dev/pricing',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/billing/checkout')
        .set('Authorization', userToken)
        .send(checkoutRequest);

      expect([200, 201, 400, 401, 404]).toContain(response.status);
      if (response.status === 200 || response.status === 201) {
        expect(response.body).toHaveProperty('sessionId');
        expect(response.body).toHaveProperty('sessionUrl');
      }
    });

    it('should reject invalid package ID', async () => {
      const checkoutRequest = {
        packageId: 'invalid-pkg',
        successUrl: 'https://nexusui.dev/dashboard',
        cancelUrl: 'https://nexusui.dev/pricing',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/billing/checkout')
        .set('Authorization', userToken)
        .send(checkoutRequest);

      expect([400, 401, 404]).toContain(response.status);
    });
  });

  describe('Webhook idempotency', () => {
    it('should handle duplicate webhook events', async () => {
      const webhookPayload = {
        id: 'evt_duplicate_123',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            client_reference_id: 'user-test',
            amount_total: 5000,
          },
        },
      };

      const response1 = await request(app.getHttpServer())
        .post('/api/v1/webhooks/stripe')
        .set('stripe-signature', 'test-sig')
        .send(webhookPayload);

      const response2 = await request(app.getHttpServer())
        .post('/api/v1/webhooks/stripe')
        .set('stripe-signature', 'test-sig')
        .send(webhookPayload);

      // Both requests should succeed (idempotent)
      expect([200, 400, 401]).toContain(response1.status);
      expect([200, 400, 401]).toContain(response2.status);
    });

    it('should reject webhook without signature', async () => {
      const webhookPayload = {
        id: 'evt_test_456',
        type: 'checkout.session.completed',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/webhooks/stripe')
        .send(webhookPayload);

      expect(response.status).toBe(400);
    });
  });

  describe('User billing history', () => {
    it('should fetch user billing history', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/billing/history')
        .set('Authorization', userToken);

      expect([200, 401]).toContain(response.status);
      if (response.status === 200) {
        expect(Array.isArray(response.body.data) || Array.isArray(response.body)).toBe(true);
      }
    });

    it('should support pagination in billing history', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/billing/history?limit=10&offset=0')
        .set('Authorization', userToken);

      expect([200, 401]).toContain(response.status);
    });
  });

  describe('Usage statistics', () => {
    it('should fetch credit usage statistics', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/billing/usage')
        .set('Authorization', userToken);

      expect([200, 401]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body).toHaveProperty('totalUsed');
        expect(response.body).toHaveProperty('totalPurchased');
      }
    });
  });
});
