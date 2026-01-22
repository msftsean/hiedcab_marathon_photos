-- Migration: photo_bibs junction table
-- Links photos to detected bib numbers

CREATE TABLE IF NOT EXISTS public.photo_bibs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    photo_id UUID NOT NULL REFERENCES public.photos(id) ON DELETE CASCADE,
    bib_number TEXT NOT NULL,
    confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    bounding_box JSONB,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes - Primary search index
CREATE INDEX IF NOT EXISTS idx_photo_bibs_bib_number ON public.photo_bibs(bib_number);
CREATE INDEX IF NOT EXISTS idx_photo_bibs_photo ON public.photo_bibs(photo_id);
CREATE INDEX IF NOT EXISTS idx_photo_bibs_high_confidence
    ON public.photo_bibs(bib_number, confidence DESC)
    WHERE confidence >= 0.8;

-- Enable Row Level Security
ALTER TABLE public.photo_bibs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can search by bib_number (this is the core feature!)
CREATE POLICY "Anyone can search by bib number"
    ON public.photo_bibs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.photos
            WHERE photos.id = photo_bibs.photo_id
            AND photos.is_visible = TRUE
            AND photos.ocr_status = 'completed'
        )
    );

-- Photographers can view bibs for their photos
CREATE POLICY "Photographers can view own photo bibs"
    ON public.photo_bibs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.photos
            WHERE photos.id = photo_bibs.photo_id
            AND photos.photographer_id = auth.uid()
        )
    );

-- Photographers can manage bibs for their photos
CREATE POLICY "Photographers can insert bibs for own photos"
    ON public.photo_bibs
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.photos
            WHERE photos.id = photo_bibs.photo_id
            AND photos.photographer_id = auth.uid()
        )
    );

CREATE POLICY "Photographers can update bibs for own photos"
    ON public.photo_bibs
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.photos
            WHERE photos.id = photo_bibs.photo_id
            AND photos.photographer_id = auth.uid()
        )
    );

CREATE POLICY "Photographers can delete bibs for own photos"
    ON public.photo_bibs
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.photos
            WHERE photos.id = photo_bibs.photo_id
            AND photos.photographer_id = auth.uid()
        )
    );
