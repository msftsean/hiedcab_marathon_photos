-- Migration: events table
-- Race or athletic events that photos are associated with

CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    date DATE NOT NULL,
    location TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    created_by UUID NOT NULL REFERENCES public.user_profiles(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Events uniquely identified by combination
    CONSTRAINT events_unique_name_date_location UNIQUE (name, date, location)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date DESC);
CREATE INDEX IF NOT EXISTS idx_events_name_trgm ON public.events USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_events_active ON public.events(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);

-- Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can view active events
CREATE POLICY "Anyone can view active events"
    ON public.events
    FOR SELECT
    USING (is_active = TRUE);

-- Photographers can create events
CREATE POLICY "Photographers can create events"
    ON public.events
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid()
            AND role = 'photographer'
        )
    );

-- Photographers can update their own events
CREATE POLICY "Photographers can update own events"
    ON public.events
    FOR UPDATE
    USING (created_by = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER trigger_events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
