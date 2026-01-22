-- Migration: photos table
-- Individual race photographs

CREATE TABLE IF NOT EXISTS public.photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    photographer_id UUID NOT NULL REFERENCES public.user_profiles(id),
    event_id UUID NOT NULL REFERENCES public.events(id),
    original_url TEXT NOT NULL,
    watermarked_url TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    width INTEGER,
    height INTEGER,
    file_size_bytes BIGINT,
    quality_score DECIMAL(3,2) CHECK (quality_score IS NULL OR (quality_score >= 0 AND quality_score <= 1)),
    ocr_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (ocr_status IN ('pending', 'processing', 'completed', 'failed', 'manual_review')),
    ocr_confidence DECIMAL(3,2) CHECK (ocr_confidence IS NULL OR (ocr_confidence >= 0 AND ocr_confidence <= 1)),
    ocr_result JSONB,
    price_cents INTEGER NOT NULL DEFAULT 100,
    purchase_count INTEGER NOT NULL DEFAULT 0,
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_photos_photographer ON public.photos(photographer_id);
CREATE INDEX IF NOT EXISTS idx_photos_event ON public.photos(event_id);
CREATE INDEX IF NOT EXISTS idx_photos_ocr_status ON public.photos(ocr_status);
CREATE INDEX IF NOT EXISTS idx_photos_quality_score
    ON public.photos(quality_score DESC)
    WHERE is_visible = TRUE;
CREATE INDEX IF NOT EXISTS idx_photos_visible_event
    ON public.photos(event_id, quality_score DESC)
    WHERE is_visible = TRUE;

-- Enable Row Level Security
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can view visible photos (watermarked/thumbnail URLs only)
CREATE POLICY "Anyone can view visible photos"
    ON public.photos
    FOR SELECT
    USING (is_visible = TRUE AND ocr_status = 'completed');

-- Photographers can view all their own photos
CREATE POLICY "Photographers can view own photos"
    ON public.photos
    FOR SELECT
    USING (photographer_id = auth.uid());

-- Photographers can insert photos
CREATE POLICY "Photographers can insert photos"
    ON public.photos
    FOR INSERT
    WITH CHECK (
        photographer_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid()
            AND role = 'photographer'
            AND stripe_connect_status = 'active'
        )
    );

-- Photographers can update their own photos
CREATE POLICY "Photographers can update own photos"
    ON public.photos
    FOR UPDATE
    USING (photographer_id = auth.uid());

-- Photographers can delete their own photos
CREATE POLICY "Photographers can delete own photos"
    ON public.photos
    FOR DELETE
    USING (photographer_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER trigger_photos_updated_at
    BEFORE UPDATE ON public.photos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
