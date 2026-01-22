import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateBatchSignedUrls, verifyPhotoAccess } from '@/lib/supabase/storage';

interface RouteContext {
  params: Promise<{ transactionId: string }>;
}

/**
 * GET /api/downloads/[transactionId]
 * Get download links for a specific transaction
 *
 * Query params:
 * - email: Email for verification (required for guest checkout)
 */
export async function GET(request: NextRequest, context: RouteContext) {
  const params = await context.params;
  const transactionId = params.transactionId;
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json(
      { error: 'validation_error', message: 'Email is required for verification' },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // Find transaction with items
  const { data: transaction, error: txError } = await supabase
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
        download_count,
        photos (
          id,
          event_id,
          thumbnail_url,
          watermarked_url,
          width,
          height,
          events (
            name,
            date
          )
        )
      )
    `)
    .eq('id', transactionId)
    .single();

  if (txError || !transaction) {
    console.error('Transaction not found:', txError);
    return NextResponse.json(
      { error: 'not_found', message: 'Transaction not found' },
      { status: 404 }
    );
  }

  // Verify email matches (case-insensitive)
  if (transaction.buyer_email.toLowerCase() !== email.toLowerCase()) {
    return NextResponse.json(
      { error: 'forbidden', message: 'Email does not match this transaction' },
      { status: 403 }
    );
  }

  // Verify transaction is completed
  if (transaction.status !== 'completed') {
    return NextResponse.json(
      { error: 'payment_pending', message: 'Payment has not been completed' },
      { status: 402 }
    );
  }

  // Extract photos from transaction items
  const photos = (transaction.transaction_items || []).map((item: any) => ({
    id: item.photos.id,
    eventId: item.photos.event_id,
    eventName: item.photos.events?.name || 'Unknown Event',
    eventDate: item.photos.events?.date,
    thumbnailUrl: item.photos.thumbnail_url,
    width: item.photos.width,
    height: item.photos.height,
    downloadCount: item.download_count,
    itemId: item.id,
  }));

  // Generate signed URLs for all photos (7 days expiration)
  const expirationSeconds = 7 * 24 * 60 * 60;
  const signedUrls = await generateBatchSignedUrls(
    photos.map((p: any) => ({ id: p.id, eventId: p.eventId })),
    expirationSeconds
  );

  // Update download count for each item
  for (const photo of photos) {
    await supabase
      .from('transaction_items')
      .update({
        download_count: (photo.downloadCount || 0) + 1,
        download_expires_at: new Date(Date.now() + expirationSeconds * 1000).toISOString(),
      })
      .eq('id', photo.itemId);
  }

  // Build response
  const downloads = photos.map((photo: any) => ({
    photo_id: photo.id,
    event_name: photo.eventName,
    event_date: photo.eventDate,
    thumbnail_url: photo.thumbnailUrl,
    download_url: signedUrls.get(photo.id) || null,
    width: photo.width,
    height: photo.height,
    expires_at: new Date(Date.now() + expirationSeconds * 1000).toISOString(),
  }));

  return NextResponse.json({
    transaction_id: transaction.id,
    downloads,
  });
}
