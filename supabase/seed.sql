-- Seed data for development testing
-- This creates test users, events, photos, and bibs for local development

-- Create test user in auth.users first (required for foreign key constraints)
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'photographer@test.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    'authenticated',
    'authenticated'
) ON CONFLICT DO NOTHING;

-- Create corresponding user_profiles entry
INSERT INTO public.user_profiles (id, display_name, role)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Test Photographer',
    'photographer'
) ON CONFLICT DO NOTHING;

-- Sample events
INSERT INTO public.events (id, name, date, location, description, created_by, is_active)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'Boston Marathon 2026', '2026-04-20', 'Boston, MA', 'The 130th running of the Boston Marathon', '00000000-0000-0000-0000-000000000001', true),
    ('22222222-2222-2222-2222-222222222222', 'NYC Half Marathon 2026', '2026-03-15', 'New York, NY', 'The annual NYC Half Marathon through Manhattan', '00000000-0000-0000-0000-000000000001', true),
    ('33333333-3333-3333-3333-333333333333', 'Chicago 10K 2026', '2026-05-01', 'Chicago, IL', 'Spring 10K race along the lakefront', '00000000-0000-0000-0000-000000000001', true)
ON CONFLICT DO NOTHING;

-- Sample photos for testing search
-- Note: URLs would be real Supabase Storage URLs in production
INSERT INTO public.photos (id, photographer_id, event_id, original_url, watermarked_url, thumbnail_url, quality_score, ocr_status, ocr_confidence, price_cents, is_visible)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
     'https://storage.test/originals/photo1.jpg', 'https://storage.test/watermarked/photo1.jpg', 'https://storage.test/thumbnails/photo1.jpg',
     0.95, 'completed', 0.98, 100, true),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
     'https://storage.test/originals/photo2.jpg', 'https://storage.test/watermarked/photo2.jpg', 'https://storage.test/thumbnails/photo2.jpg',
     0.88, 'completed', 0.95, 100, true),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '00000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222',
     'https://storage.test/originals/photo3.jpg', 'https://storage.test/watermarked/photo3.jpg', 'https://storage.test/thumbnails/photo3.jpg',
     0.92, 'completed', 0.99, 100, true),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', '00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
     'https://storage.test/originals/photo4.jpg', 'https://storage.test/watermarked/photo4.jpg', 'https://storage.test/thumbnails/photo4.jpg',
     0.75, 'manual_review', 0.55, 100, false)
ON CONFLICT DO NOTHING;

-- Sample bib detections
INSERT INTO public.photo_bibs (photo_id, bib_number, confidence, is_verified)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '12345', 0.98, true),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '12346', 0.85, false),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '12345', 0.95, true),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '67890', 0.99, true),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '12345', 0.92, true)
ON CONFLICT DO NOTHING;

-- Note: To fully test, you'll need to:
-- 1. Create a test user through Supabase Auth UI
-- 2. Update the photographer_id (00000000-0000-0000-0000-000000000001) with the real user UUID
-- 3. Upload actual images to Supabase Storage
-- 4. Update the URLs to point to real storage paths
