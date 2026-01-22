import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateBatchSignedUrls } from '@/lib/supabase/storage';

/**
 * GET /api/downloads
 * Get download links for purchased photos
 *
 * Query params:
 * - session_id: Stripe checkout session ID
 * - transaction_id: Transaction ID (alternative)
 * - email: Email for verification (required for guest checkout)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');
  const transactionId = searchParams.get('transaction_id');
  const email = searchParams.get('email');

  if (!sessionId && !transactionId) {
    return NextResponse.json(
      { error: 'validation_error', message: 'session_id or transaction_id is required' },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // Find transaction by session_id or transaction_id
  let query = supabase
    .from('transactions')
    .select(`
      id,
      buyer_email,
      status,
      amount_cents,
      created_at,
      transaction_items (
        id,
        photo_id,
        photos (
          id,
          event_id,
          thumbnail_url,
          watermarked_url,
          events (
            name
          )
        )
      )
    `);

  if (sessionId) {
    query = query.eq('stripe_checkout_session_id', sessionId);
  } else if (transactionId) {
    query = query.eq('id', transactionId);
  }

  const { data: transaction, error: txError } = await query.single();

  if (txError || !transaction) {
    console.error('Transaction not found:', txError);
    return NextResponse.json(
      { error: 'not_found', message: 'Transaction not found' },
      { status: 404 }
    );
  }

  // Verify transaction is completed
  if (transaction.status !== 'completed') {
    return NextResponse.json(
      { error: 'payment_pending', message: 'Payment has not been completed' },
      { status: 402 }
    );
  }

  // For guest checkout, verify email matches
  if (email && transaction.buyer_email.toLowerCase() !== email.toLowerCase()) {
    return NextResponse.json(
      { error: 'forbidden', message: 'Email does not match transaction' },
      { status: 403 }
    );
  }

  // Extract photos from transaction items
  const photos = (transaction.transaction_items || []).map((item: any) => ({
    id: item.photos.id,
    eventId: item.photos.event_id,
    eventName: item.photos.events?.name || 'Unknown Event',
    thumbnailUrl: item.photos.thumbnail_url,
  }));

  // Generate signed URLs for all photos
  const signedUrls = await generateBatchSignedUrls(
    photos.map((p: any) => ({ id: p.id, eventId: p.eventId })),
    7 * 24 * 60 * 60 // 7 days expiration
  );

  // Build response with download links
  const downloads = photos.map((photo: any) => ({
    id: photo.id,
    eventName: photo.eventName,
    thumbnailUrl: photo.thumbnailUrl,
    downloadUrl: signedUrls.get(photo.id) || null,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  }));

  return NextResponse.json({
    id: transaction.id,
    email: transaction.buyer_email,
    purchasedAt: transaction.created_at,
    photos: downloads,
  });
}
