import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const photoId = params.id;

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(photoId)) {
    return NextResponse.json(
      { error: 'Invalid photo ID format' },
      { status: 400 }
    );
  }

  try {
    const supabase = await createClient();

    // Get photo with event info - only visible photos
    const { data: photo, error } = await supabase
      .from('photos')
      .select(`
        id,
        event_id,
        watermarked_url,
        thumbnail_url,
        quality_score,
        price_cents,
        is_visible,
        events (
          id,
          name,
          date,
          location
        )
      `)
      .eq('id', photoId)
      .eq('is_visible', true)
      .single();

    if (error || !photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      );
    }

    // Get bib numbers associated with this photo
    const { data: bibs } = await supabase
      .from('photo_bibs')
      .select('bib_number, confidence')
      .eq('photo_id', photoId)
      .order('confidence', { ascending: false });

    // Format response (never expose original_url)
    const event = photo.events as { id: string; name: string; date: string; location: string | null } | null;

    const response = {
      id: photo.id,
      eventId: photo.event_id,
      eventName: event?.name || 'Unknown Event',
      eventDate: event?.date || '',
      eventLocation: event?.location || undefined,
      watermarkedUrl: photo.watermarked_url,
      thumbnailUrl: photo.thumbnail_url,
      qualityScore: photo.quality_score ? Number(photo.quality_score) : undefined,
      priceCents: photo.price_cents,
      bibNumbers: bibs?.map((b) => ({
        number: b.bib_number,
        confidence: Number(b.confidence),
      })) || [],
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Photo fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photo' },
      { status: 500 }
    );
  }
}
