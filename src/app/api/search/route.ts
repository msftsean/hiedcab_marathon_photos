import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { SearchResponse, PhotoPreview } from '@/types';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const bibNumber = searchParams.get('bib');
  const eventId = searchParams.get('eventId');
  const sort = searchParams.get('sort') || 'quality';
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
  const cursor = searchParams.get('cursor');

  // Validate bib number
  if (!bibNumber) {
    return NextResponse.json(
      { error: 'Bib number is required' },
      { status: 400 }
    );
  }

  if (!/^\d+$/.test(bibNumber)) {
    return NextResponse.json(
      { error: 'Invalid bib number format' },
      { status: 400 }
    );
  }

  try {
    const supabase = await createClient();

    // Use the optimized search function
    const { data, error } = await supabase.rpc('search_photos_by_bib', {
      p_bib_number: bibNumber,
      p_event_id: eventId || null,
      p_sort: sort === 'recent' ? 'recent' : 'quality',
      p_limit: limit + 1, // Fetch one extra to check if there are more
      p_cursor: cursor || null,
    });

    if (error) {
      console.error('Search error:', error);
      return NextResponse.json(
        { error: 'Failed to search photos' },
        { status: 500 }
      );
    }

    // Check if there are more results
    const hasMore = data && data.length > limit;
    const photos = (data || []).slice(0, limit);

    // Map to response format
    const mappedPhotos: PhotoPreview[] = photos.map((row: any) => ({
      id: row.photo_id,
      eventId: row.event_id,
      eventName: row.event_name,
      eventDate: row.event_date,
      eventLocation: row.event_location || undefined,
      watermarkedUrl: row.watermarked_url,
      thumbnailUrl: row.thumbnail_url,
      qualityScore: row.quality_score ? Number(row.quality_score) : undefined,
      priceCents: row.price_cents,
      bibConfidence: row.bib_confidence ? Number(row.bib_confidence) : undefined,
    }));

    // Generate next cursor if there are more results
    const nextCursor = hasMore && photos.length > 0
      ? photos[photos.length - 1].photo_id
      : undefined;

    const response: SearchResponse = {
      photos: mappedPhotos,
      totalCount: mappedPhotos.length,
      hasMore,
      nextCursor,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Unexpected search error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
