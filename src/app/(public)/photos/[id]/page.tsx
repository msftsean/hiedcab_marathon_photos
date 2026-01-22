import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PhotoDetailClient } from './PhotoDetailClient';

interface PhotoPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PhotoPageProps) {
  const supabase = await createClient();

  const { data: photo } = await supabase
    .from('photos')
    .select(`
      id,
      events (name, date)
    `)
    .eq('id', params.id)
    .eq('is_visible', true)
    .single();

  if (!photo) {
    return {
      title: 'Photo Not Found',
    };
  }

  const event = photo.events as { name: string; date: string } | null;

  return {
    title: `Race Photo - ${event?.name || 'Event'}`,
    description: `Purchase your race photo from ${event?.name || 'this event'}`,
  };
}

export default async function PhotoPage({ params }: PhotoPageProps) {
  const supabase = await createClient();

  // Fetch photo with event info
  const { data: photo, error } = await supabase
    .from('photos')
    .select(`
      id,
      event_id,
      watermarked_url,
      thumbnail_url,
      quality_score,
      price_cents,
      events (
        id,
        name,
        date,
        location
      )
    `)
    .eq('id', params.id)
    .eq('is_visible', true)
    .single();

  if (error || !photo) {
    notFound();
  }

  // Get bib numbers for this photo
  const { data: bibs } = await supabase
    .from('photo_bibs')
    .select('bib_number, confidence')
    .eq('photo_id', params.id)
    .order('confidence', { ascending: false });

  const event = photo.events as { id: string; name: string; date: string; location: string | null } | null;

  const photoData = {
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

  return <PhotoDetailClient photo={photoData} />;
}
