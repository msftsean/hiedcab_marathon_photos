import { createClient } from './server';

/**
 * Storage bucket names
 */
export const STORAGE_BUCKETS = {
  ORIGINALS: 'photos-original',
  WATERMARKED: 'photos-watermarked',
  THUMBNAILS: 'photos-thumbnails',
} as const;

/**
 * Generate a signed URL for accessing original (unwatermarked) photos
 * Only valid for users who have purchased the photo
 *
 * @param photoId - The photo ID
 * @param eventId - The event ID for path construction
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns Signed URL or null if generation fails
 */
export async function generateSignedDownloadUrl(
  photoId: string,
  eventId: string,
  expiresIn: number = 3600
): Promise<string | null> {
  const supabase = await createClient();

  // Construct the storage path: {eventId}/{photoId}.jpg
  const storagePath = `${eventId}/${photoId}.jpg`;

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.ORIGINALS)
    .createSignedUrl(storagePath, expiresIn, {
      download: true, // Triggers download instead of display
    });

  if (error) {
    console.error('Failed to generate signed URL:', error);
    return null;
  }

  return data.signedUrl;
}

/**
 * Generate signed URLs for multiple photos
 *
 * @param photos - Array of photo objects with id and eventId
 * @param expiresIn - Expiration time in seconds
 * @returns Map of photoId to signedUrl
 */
export async function generateBatchSignedUrls(
  photos: Array<{ id: string; eventId: string }>,
  expiresIn: number = 3600
): Promise<Map<string, string>> {
  const supabase = await createClient();
  const urlMap = new Map<string, string>();

  // Create paths for all photos
  const paths = photos.map((photo) => `${photo.eventId}/${photo.id}.jpg`);

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.ORIGINALS)
    .createSignedUrls(paths, expiresIn, {
      download: true,
    });

  if (error) {
    console.error('Failed to generate batch signed URLs:', error);
    return urlMap;
  }

  // Map results back to photo IDs
  data.forEach((result, index) => {
    if (result.signedUrl) {
      urlMap.set(photos[index].id, result.signedUrl);
    }
  });

  return urlMap;
}

/**
 * Get the public URL for a watermarked photo
 * These are accessible without authentication
 *
 * @param photoId - The photo ID
 * @param eventId - The event ID
 * @returns Public URL for the watermarked photo
 */
export function getWatermarkedUrl(photoId: string, eventId: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  }

  return `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKETS.WATERMARKED}/${eventId}/${photoId}.jpg`;
}

/**
 * Get the public URL for a thumbnail
 *
 * @param photoId - The photo ID
 * @param eventId - The event ID
 * @returns Public URL for the thumbnail
 */
export function getThumbnailUrl(photoId: string, eventId: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  }

  return `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKETS.THUMBNAILS}/${eventId}/${photoId}.jpg`;
}

/**
 * Verify that a user has purchased a photo (has access rights)
 *
 * @param email - Customer email
 * @param photoId - Photo ID to check access for
 * @returns True if user has purchased this photo
 */
export async function verifyPhotoAccess(
  email: string,
  photoId: string
): Promise<boolean> {
  const supabase = await createClient();

  // Check if there's a completed transaction with this photo for this email
  const { data, error } = await supabase
    .from('transaction_items')
    .select(`
      id,
      transactions!inner (
        customer_email,
        status
      )
    `)
    .eq('photo_id', photoId)
    .eq('transactions.customer_email', email)
    .eq('transactions.status', 'completed')
    .limit(1);

  if (error) {
    console.error('Error verifying photo access:', error);
    return false;
  }

  return data && data.length > 0;
}

/**
 * Get all photos a user has purchased
 *
 * @param email - Customer email
 * @returns Array of purchased photo details
 */
export async function getPurchasedPhotos(
  email: string
): Promise<Array<{
  id: string;
  eventId: string;
  eventName: string;
  purchasedAt: string;
  transactionId: string;
}>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('transaction_items')
    .select(`
      photo_id,
      transaction_id,
      transactions!inner (
        customer_email,
        status,
        created_at
      ),
      photos!inner (
        id,
        event_id,
        events (
          name
        )
      )
    `)
    .eq('transactions.customer_email', email)
    .eq('transactions.status', 'completed');

  if (error) {
    console.error('Error fetching purchased photos:', error);
    return [];
  }

  return (data || []).map((item: any) => ({
    id: item.photo_id,
    eventId: item.photos.event_id,
    eventName: item.photos.events?.name || 'Unknown Event',
    purchasedAt: item.transactions.created_at,
    transactionId: item.transaction_id,
  }));
}
