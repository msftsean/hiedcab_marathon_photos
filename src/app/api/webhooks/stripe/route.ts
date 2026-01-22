import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { verifyWebhookSignature, getStripeServer } from '@/lib/stripe/client';
import { calculateRevenueSplit } from '@/lib/utils/pricing';

// Disable body parsing for webhook signature verification
export const runtime = 'nodejs';

/**
 * Stripe webhook handler
 * Handles checkout.session.completed events to create transactions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('Missing Stripe signature');
      return NextResponse.json(
        { error: 'Missing Stripe signature' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = verifyWebhookSignature(body, signature);
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'payment_intent.succeeded':
        // Log for debugging, main logic handled in checkout.session.completed
        console.log('Payment intent succeeded:', (event.data.object as Stripe.PaymentIntent).id);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle successful checkout session
 * Creates transaction record and grants photo access
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const supabase = await createClient();

  // Extract metadata
  const { photoIds: photoIdsJson, email, photoCount, bundleType } = session.metadata || {};

  if (!photoIdsJson || !email) {
    console.error('Missing required metadata in checkout session');
    return;
  }

  let photoIds: string[];
  try {
    photoIds = JSON.parse(photoIdsJson);
  } catch {
    console.error('Invalid photoIds JSON in metadata');
    return;
  }

  if (!Array.isArray(photoIds) || photoIds.length === 0) {
    console.error('No photo IDs in checkout session');
    return;
  }

  // Check if transaction already exists (idempotency)
  const { data: existingTx } = await supabase
    .from('transactions')
    .select('id')
    .eq('stripe_checkout_session_id', session.id)
    .single();

  if (existingTx) {
    console.log(`Transaction already exists for session ${session.id}`);
    return;
  }

  // Fetch photos to get photographer info and calculate splits
  const { data: photos, error: photosError } = await supabase
    .from('photos')
    .select('id, photographer_id, price_cents, event_id')
    .in('id', photoIds);

  if (photosError || !photos || photos.length === 0) {
    console.error('Failed to fetch photos:', photosError);
    return;
  }

  // Calculate revenue split
  const totalCents = session.amount_total || 0;
  const revenueSplit = calculateRevenueSplit(totalCents);

  // For V1, assume single photographer per order
  // Calculate per-photo splits based on proportional pricing
  const photoIdToData = new Map(photos.map((p) => [p.id, p]));

  // Create transaction record
  const { data: transaction, error: transactionError } = await supabase
    .from('transactions')
    .insert({
      stripe_payment_intent_id: typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id || session.id,
      stripe_checkout_session_id: session.id,
      buyer_email: email,
      amount_cents: totalCents,
      platform_fee_cents: revenueSplit.platformFeeCents,
      photographer_amount_cents: revenueSplit.photographerAmountCents,
      status: 'completed',
      completed_at: new Date().toISOString(),
      currency: session.currency || 'usd',
      metadata: {
        photoCount: parseInt(photoCount || '0', 10),
        bundleType,
      },
    })
    .select()
    .single();

  if (transactionError) {
    console.error('Failed to create transaction:', transactionError);
    return;
  }

  // Calculate per-photo amount for transaction items
  const perPhotoAmount = Math.floor(revenueSplit.photographerAmountCents / photos.length);
  const remainder = revenueSplit.photographerAmountCents - (perPhotoAmount * photos.length);

  // Create transaction items for each photo
  const transactionItems = photoIds.map((photoId, index) => {
    const photoData = photoIdToData.get(photoId);
    // Add remainder to first item to ensure total matches
    const photographerAmount = perPhotoAmount + (index === 0 ? remainder : 0);

    return {
      transaction_id: transaction.id,
      photo_id: photoId,
      photographer_id: photoData?.photographer_id,
      price_cents: photoData?.price_cents || 100,
      photographer_amount_cents: photographerAmount,
    };
  });

  const { error: itemsError } = await supabase
    .from('transaction_items')
    .insert(transactionItems);

  if (itemsError) {
    console.error('Failed to create transaction items:', itemsError);
    // Continue anyway - transaction is already created
  }

  // Note: purchase_count is automatically incremented by database trigger

  console.log(`Transaction ${transaction.id} created for ${photoIds.length} photos`);
}

/**
 * Handle failed payment intent
 */
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.error(
    'Payment failed:',
    paymentIntent.id,
    paymentIntent.last_payment_error?.message
  );

  // Could add notification logic here for failed payments
  // For V1, just log the error
}
