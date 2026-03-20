import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    const apiKey = process.env['STRIPE_SECRET_KEY'];
    if (!apiKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }
    stripeInstance = new Stripe(apiKey, {
      apiVersion: '2025-02-24.acacia',
    });
  }
  return stripeInstance;
}

const WEBHOOK_SECRET = process.env['STRIPE_WEBHOOK_SECRET'] ?? '';

/**
 * Stripe webhook handler.
 * Forwards verified events to the NestJS API for credit fulfillment.
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook signature verification failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // Forward verified event to NestJS API for processing
  const apiUrl = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000';
  try {
    const res = await fetch(`${apiUrl}/webhooks/stripe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Stripe-Event': event.type,
        // Internal secret to authenticate forwarded events
        'X-Internal-Secret': process.env['INTERNAL_API_SECRET'] ?? '',
      },
      body: JSON.stringify(event),
    });

    if (!res.ok) {
      console.error('[stripe-webhook] API forwarding failed:', res.status, await res.text());
      return NextResponse.json({ error: 'Event processing failed' }, { status: 500 });
    }
  } catch (err) {
    console.error('[stripe-webhook] Failed to forward event:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
