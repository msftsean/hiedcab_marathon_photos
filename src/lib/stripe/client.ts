import { loadStripe, type Stripe } from '@stripe/stripe-js';
import StripeServer from 'stripe';

// Client-side Stripe instance (singleton)
let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Get the Stripe.js instance for client-side usage
 * Returns a singleton promise that resolves to the Stripe instance
 */
export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      console.error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
}

// Server-side Stripe instance (singleton)
let stripeServer: StripeServer | null = null;

/**
 * Get the Stripe server-side instance
 * Use this for API routes and server components
 */
export function getStripeServer(): StripeServer {
  if (!stripeServer) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('Missing STRIPE_SECRET_KEY environment variable');
    }
    stripeServer = new StripeServer(secretKey, {
      apiVersion: '2024-06-20',
      typescript: true,
    });
  }
  return stripeServer;
}

/**
 * Verify Stripe webhook signature
 * @param payload - Raw request body
 * @param signature - Stripe-Signature header value
 * @returns Parsed webhook event
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): StripeServer.Event {
  const stripe = getStripeServer();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error('Missing STRIPE_WEBHOOK_SECRET environment variable');
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}
