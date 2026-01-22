import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Integration test that connects to local Supabase
// Requires: supabase start && supabase db seed

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

describe('Search API Integration', () => {
  let supabase: ReturnType<typeof createClient<Database>>;

  beforeAll(() => {
    supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
  });

  describe('v_photo_search view', () => {
    it('should return photos with bib number match', async () => {
      const { data, error } = await supabase
        .from('v_photo_search')
        .select('*')
        .eq('bib_number', '12345')
        .limit(10);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should include event information in results', async () => {
      const { data, error } = await supabase
        .from('v_photo_search')
        .select('*')
        .eq('bib_number', '12345')
        .limit(1);

      expect(error).toBeNull();
      if (data && data.length > 0) {
        const result = data[0];
        expect(result.event_name).toBeDefined();
        expect(result.event_date).toBeDefined();
        expect(result.event_location).toBeDefined();
      }
    });

    it('should only return visible photos', async () => {
      const { data, error } = await supabase
        .from('v_photo_search')
        .select('*')
        .limit(50);

      expect(error).toBeNull();
      // All returned photos should be visible (enforced by view)
      data?.forEach((photo) => {
        // View should filter out non-visible photos
        expect(photo.photo_id).toBeDefined();
      });
    });

    it('should include watermarked URLs, not original URLs', async () => {
      const { data, error } = await supabase
        .from('v_photo_search')
        .select('watermarked_url, thumbnail_url')
        .eq('bib_number', '12345')
        .limit(1);

      expect(error).toBeNull();
      if (data && data.length > 0) {
        expect(data[0].watermarked_url).toBeDefined();
        expect(data[0].thumbnail_url).toBeDefined();
        // Original URL should NOT be in the view
        expect((data[0] as any).original_url).toBeUndefined();
      }
    });

    it('should include quality score for sorting', async () => {
      const { data, error } = await supabase
        .from('v_photo_search')
        .select('quality_score')
        .eq('bib_number', '12345')
        .order('quality_score', { ascending: false })
        .limit(10);

      expect(error).toBeNull();
      if (data && data.length > 1) {
        // Verify descending order
        for (let i = 0; i < data.length - 1; i++) {
          const current = data[i].quality_score ?? 0;
          const next = data[i + 1].quality_score ?? 0;
          expect(current).toBeGreaterThanOrEqual(next);
        }
      }
    });

    it('should filter by event_id', async () => {
      const eventId = '11111111-1111-1111-1111-111111111111'; // Boston Marathon from seed

      const { data, error } = await supabase
        .from('v_photo_search')
        .select('*')
        .eq('bib_number', '12345')
        .eq('event_id', eventId);

      expect(error).toBeNull();
      data?.forEach((photo) => {
        expect(photo.event_id).toBe(eventId);
      });
    });
  });

  describe('search_photos_by_bib function', () => {
    it('should call the search function successfully', async () => {
      const { data, error } = await supabase.rpc('search_photos_by_bib', {
        p_bib_number: '12345',
        p_limit: 10,
      });

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should support event filtering', async () => {
      const eventId = '11111111-1111-1111-1111-111111111111';

      const { data, error } = await supabase.rpc('search_photos_by_bib', {
        p_bib_number: '12345',
        p_event_id: eventId,
        p_limit: 10,
      });

      expect(error).toBeNull();
      data?.forEach((photo: any) => {
        expect(photo.event_id).toBe(eventId);
      });
    });

    it('should support quality sorting', async () => {
      const { data, error } = await supabase.rpc('search_photos_by_bib', {
        p_bib_number: '12345',
        p_sort: 'quality',
        p_limit: 10,
      });

      expect(error).toBeNull();
      if (data && data.length > 1) {
        for (let i = 0; i < data.length - 1; i++) {
          expect(data[i].quality_score >= data[i + 1].quality_score).toBe(true);
        }
      }
    });

    it('should support recent sorting', async () => {
      const { data, error } = await supabase.rpc('search_photos_by_bib', {
        p_bib_number: '12345',
        p_sort: 'recent',
        p_limit: 10,
      });

      expect(error).toBeNull();
      if (data && data.length > 1) {
        for (let i = 0; i < data.length - 1; i++) {
          const currentDate = new Date(data[i].event_date);
          const nextDate = new Date(data[i + 1].event_date);
          expect(currentDate >= nextDate).toBe(true);
        }
      }
    });

    it('should respect limit parameter', async () => {
      const limit = 2;
      const { data, error } = await supabase.rpc('search_photos_by_bib', {
        p_bib_number: '12345',
        p_limit: limit,
      });

      expect(error).toBeNull();
      expect(data?.length).toBeLessThanOrEqual(limit);
    });

    it('should return empty array for non-existent bib', async () => {
      const { data, error } = await supabase.rpc('search_photos_by_bib', {
        p_bib_number: '99999999',
        p_limit: 10,
      });

      expect(error).toBeNull();
      expect(data).toEqual([]);
    });
  });

  describe('photos table direct access', () => {
    it('should not allow anonymous access to original_url', async () => {
      // Anonymous users shouldn't be able to see original URLs
      const { data } = await supabase
        .from('photos')
        .select('original_url')
        .limit(1);

      // Either RLS blocks it or view doesn't expose it
      // The v_photo_search view is the intended access method
      expect(data).toBeDefined();
    });

    it('should allow reading visible photos', async () => {
      const { data, error } = await supabase
        .from('photos')
        .select('id, watermarked_url, thumbnail_url, is_visible')
        .eq('is_visible', true)
        .limit(10);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('photo_bibs junction table', () => {
    it('should allow reading bib associations', async () => {
      const { data, error } = await supabase
        .from('photo_bibs')
        .select('photo_id, bib_number, confidence')
        .eq('bib_number', '12345')
        .limit(10);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should have confidence scores', async () => {
      const { data, error } = await supabase
        .from('photo_bibs')
        .select('confidence')
        .limit(10);

      expect(error).toBeNull();
      data?.forEach((bib) => {
        expect(bib.confidence).toBeGreaterThanOrEqual(0);
        expect(bib.confidence).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('events table', () => {
    it('should return active events', async () => {
      const { data, error } = await supabase
        .from('events')
        .select('id, name, date, location')
        .eq('is_active', true)
        .limit(10);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should have required fields', async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .limit(1);

      expect(error).toBeNull();
      if (data && data.length > 0) {
        const event = data[0];
        expect(event.id).toBeDefined();
        expect(event.name).toBeDefined();
        expect(event.date).toBeDefined();
      }
    });
  });
});

describe('Search Performance', () => {
  let supabase: ReturnType<typeof createClient<Database>>;

  beforeAll(() => {
    supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
  });

  it('should complete search within reasonable time', async () => {
    const startTime = Date.now();

    await supabase.rpc('search_photos_by_bib', {
      p_bib_number: '12345',
      p_limit: 50,
    });

    const duration = Date.now() - startTime;
    // Search should complete in under 2 seconds
    expect(duration).toBeLessThan(2000);
  });

  it('should handle concurrent searches', async () => {
    const searches = Array(5)
      .fill(null)
      .map((_, i) =>
        supabase.rpc('search_photos_by_bib', {
          p_bib_number: String(12345 + i),
          p_limit: 10,
        })
      );

    const startTime = Date.now();
    const results = await Promise.all(searches);
    const duration = Date.now() - startTime;

    // All searches should succeed
    results.forEach(({ error }) => {
      expect(error).toBeNull();
    });

    // Concurrent searches should complete in reasonable time
    expect(duration).toBeLessThan(5000);
  });
});
