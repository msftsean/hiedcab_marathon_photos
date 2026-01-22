/**
 * Image URL utilities for working with Supabase Storage
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

export interface StoragePaths {
  originalPath: string;
  watermarkedPath: string;
  thumbnailPath: string;
}

/**
 * Generate storage paths for a photo
 * @param photoId - UUID of the photo
 * @param eventId - UUID of the event
 * @param extension - File extension (default: jpg)
 * @returns Storage paths for original, watermarked, and thumbnail versions
 */
export function getStoragePaths(
  photoId: string,
  eventId: string,
  extension: string = 'jpg'
): StoragePaths {
  return {
    originalPath: `originals/${eventId}/${photoId}.${extension}`,
    watermarkedPath: `watermarked/${eventId}/${photoId}.${extension}`,
    thumbnailPath: `thumbnails/${eventId}/${photoId}.${extension}`,
  };
}

/**
 * Get public URL for a storage path
 * @param bucket - Storage bucket name
 * @param path - Path within the bucket
 * @returns Public URL string
 */
export function getPublicUrl(bucket: string, path: string): string {
  if (!SUPABASE_URL) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL');
    return '';
  }
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

/**
 * Get watermarked preview URL for a photo
 * @param photoId - UUID of the photo
 * @param eventId - UUID of the event
 * @returns Public URL for the watermarked version
 */
export function getWatermarkedUrl(photoId: string, eventId: string): string {
  const paths = getStoragePaths(photoId, eventId);
  return getPublicUrl('photos', paths.watermarkedPath);
}

/**
 * Get thumbnail URL for a photo
 * @param photoId - UUID of the photo
 * @param eventId - UUID of the event
 * @returns Public URL for the thumbnail
 */
export function getThumbnailUrl(photoId: string, eventId: string): string {
  const paths = getStoragePaths(photoId, eventId);
  return getPublicUrl('photos', paths.thumbnailPath);
}

/**
 * Transform Supabase storage URL with image transformations
 * @param url - Original storage URL
 * @param options - Transformation options
 * @returns Transformed URL
 */
export function transformImageUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'origin';
  }
): string {
  const transformParams: string[] = [];

  if (options.width) transformParams.push(`width=${options.width}`);
  if (options.height) transformParams.push(`height=${options.height}`);
  if (options.quality) transformParams.push(`quality=${options.quality}`);
  if (options.format) transformParams.push(`format=${options.format}`);

  if (transformParams.length === 0) return url;

  // Replace /object/public/ with /render/image/public/ for transformations
  const renderUrl = url.replace('/object/public/', '/render/image/public/');
  const separator = renderUrl.includes('?') ? '&' : '?';

  return `${renderUrl}${separator}${transformParams.join('&')}`;
}

/**
 * Generate blur placeholder data URL for images
 * @param width - Placeholder width
 * @param height - Placeholder height
 * @returns Base64 data URL for a gray placeholder
 */
export function getBlurPlaceholder(width: number = 10, height: number = 10): string {
  // Simple gray SVG placeholder
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <rect width="100%" height="100%" fill="#e5e7eb"/>
    </svg>
  `.trim();

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Check if a URL is a valid Supabase storage URL
 * @param url - URL to check
 * @returns Boolean indicating if URL is from Supabase storage
 */
export function isSupabaseStorageUrl(url: string): boolean {
  if (!SUPABASE_URL) return false;
  return url.startsWith(SUPABASE_URL) && url.includes('/storage/');
}
