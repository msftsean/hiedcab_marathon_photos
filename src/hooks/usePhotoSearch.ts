'use client';

import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { PhotoPreview } from '@/types';

interface UsePhotoSearchOptions {
  bibNumber: string | null;
  eventId?: string | null;
  sort?: 'quality' | 'recent';
  limit?: number;
}

interface UsePhotoSearchResult {
  photos: PhotoPreview[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function usePhotoSearch({
  bibNumber,
  eventId,
  sort = 'quality',
  limit = 20,
}: UsePhotoSearchOptions): UsePhotoSearchResult {
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  const fetchPhotos = useCallback(
    async (append: boolean = false) => {
      if (!bibNumber) {
        setPhotos([]);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const supabase = createClient();

        let query = supabase
          .from('v_photo_search')
          .select('*')
          .eq('bib_number', bibNumber);

        if (eventId) {
          query = query.eq('event_id', eventId);
        }

        if (sort === 'quality') {
          query = query.order('quality_score', { ascending: false, nullsFirst: false });
        } else {
          query = query.order('event_date', { ascending: false });
        }

        const currentOffset = append ? offset : 0;
        query = query.range(currentOffset, currentOffset + limit - 1);

        const { data, error: queryError } = await query;

        if (queryError) {
          throw new Error(queryError.message);
        }

        const mappedPhotos: PhotoPreview[] = (data || []).map((row) => ({
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

        if (append) {
          setPhotos((prev) => [...prev, ...mappedPhotos]);
        } else {
          setPhotos(mappedPhotos);
        }

        setHasMore(mappedPhotos.length === limit);
        setOffset(currentOffset + mappedPhotos.length);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to search photos';
        setError(message);
        if (!append) {
          setPhotos([]);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [bibNumber, eventId, sort, limit, offset]
  );

  const loadMore = useCallback(async () => {
    if (!isLoading && hasMore) {
      await fetchPhotos(true);
    }
  }, [fetchPhotos, isLoading, hasMore]);

  const refetch = useCallback(async () => {
    setOffset(0);
    await fetchPhotos(false);
  }, [fetchPhotos]);

  // Fetch when search parameters change
  useEffect(() => {
    setOffset(0);
    fetchPhotos(false);
  }, [bibNumber, eventId, sort]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    photos,
    isLoading,
    error,
    hasMore,
    loadMore,
    refetch,
  };
}
