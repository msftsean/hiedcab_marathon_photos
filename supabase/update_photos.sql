-- Update photos to use real marathon runner images
-- First delete existing photo_bibs and photos, then re-insert

-- Delete existing data (cascade will handle photo_bibs)
DELETE FROM public.photo_bibs;
DELETE FROM public.photos;

-- Insert new photos with runner images from Unsplash
INSERT INTO public.photos (id, photographer_id, event_id, original_url, watermarked_url, thumbnail_url, quality_score, ocr_status, ocr_confidence, price_cents, is_visible)
VALUES
    -- Boston Marathon photos
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
     'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1200',
     'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800',
     'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=300',
     0.95, 'completed', 0.98, 100, true),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
     'https://images.unsplash.com/photo-1596727362302-b8d891c42ab8?w=1200',
     'https://images.unsplash.com/photo-1596727362302-b8d891c42ab8?w=800',
     'https://images.unsplash.com/photo-1596727362302-b8d891c42ab8?w=300',
     0.88, 'completed', 0.95, 100, true),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', '00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
     'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=1200',
     'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800',
     'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=300',
     0.91, 'completed', 0.97, 100, true),
    -- NYC Half Marathon photos
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '00000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222',
     'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=1200',
     'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800',
     'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=300',
     0.92, 'completed', 0.99, 100, true),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '00000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222',
     'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1200',
     'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800',
     'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=300',
     0.89, 'completed', 0.96, 100, true),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', '00000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222',
     'https://images.unsplash.com/photo-1594882645126-14020914d58d?w=1200',
     'https://images.unsplash.com/photo-1594882645126-14020914d58d?w=800',
     'https://images.unsplash.com/photo-1594882645126-14020914d58d?w=300',
     0.87, 'completed', 0.93, 100, true),
    -- Chicago 10K photos
    ('11111111-aaaa-bbbb-cccc-dddddddddddd', '00000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333',
     'https://images.unsplash.com/photo-1486218119243-13883505764c?w=1200',
     'https://images.unsplash.com/photo-1486218119243-13883505764c?w=800',
     'https://images.unsplash.com/photo-1486218119243-13883505764c?w=300',
     0.94, 'completed', 0.98, 100, true),
    ('22222222-aaaa-bbbb-cccc-dddddddddddd', '00000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333',
     'https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?w=1200',
     'https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?w=800',
     'https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?w=300',
     0.90, 'completed', 0.95, 100, true),
    -- Manual review photo (low confidence)
    ('33333333-aaaa-bbbb-cccc-dddddddddddd', '00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
     'https://images.unsplash.com/photo-1502904550040-7534597429ae?w=1200',
     'https://images.unsplash.com/photo-1502904550040-7534597429ae?w=800',
     'https://images.unsplash.com/photo-1502904550040-7534597429ae?w=300',
     0.75, 'manual_review', 0.55, 100, false);

-- Insert bib detections
INSERT INTO public.photo_bibs (photo_id, bib_number, confidence, is_verified)
VALUES
    -- Runner 12345 appears in multiple events
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '12345', 0.98, true),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '12346', 0.85, false),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '12345', 0.95, true),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', '12345', 0.97, true),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '67890', 0.99, true),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '12345', 0.92, true),
    -- NYC Half Marathon bibs
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '54321', 0.96, true),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', '67890', 0.94, true),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', '11111', 0.88, true),
    -- Chicago 10K bibs
    ('11111111-aaaa-bbbb-cccc-dddddddddddd', '99999', 0.98, true),
    ('11111111-aaaa-bbbb-cccc-dddddddddddd', '12345', 0.91, true),
    ('22222222-aaaa-bbbb-cccc-dddddddddddd', '88888', 0.97, true),
    ('22222222-aaaa-bbbb-cccc-dddddddddddd', '77777', 0.93, true),
    -- Manual review photo
    ('33333333-aaaa-bbbb-cccc-dddddddddddd', '12345', 0.55, false);
