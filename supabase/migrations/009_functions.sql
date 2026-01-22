-- Migration: database functions
-- Utility functions for business logic

-- calculate_transaction_splits: Calculates platform fee and photographer amount
CREATE OR REPLACE FUNCTION public.calculate_transaction_splits(amount_cents INTEGER)
RETURNS TABLE (platform_fee_cents INTEGER, photographer_amount_cents INTEGER) AS $$
BEGIN
    RETURN QUERY SELECT
        ROUND(amount_cents * 0.30)::INTEGER AS platform_fee_cents,
        ROUND(amount_cents * 0.70)::INTEGER AS photographer_amount_cents;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- calculate_bundle_price: Calculates the total price for a bundle of photos
CREATE OR REPLACE FUNCTION public.calculate_bundle_price(photo_count INTEGER)
RETURNS TABLE (total_cents INTEGER, bundle_type TEXT) AS $$
BEGIN
    IF photo_count >= 20 THEN
        -- 20-pack: $12
        RETURN QUERY SELECT 1200, 'pack_20'::TEXT;
    ELSIF photo_count >= 10 THEN
        -- 10-pack: $7
        RETURN QUERY SELECT 700, 'pack_10'::TEXT;
    ELSIF photo_count >= 5 THEN
        -- 5-pack: $4
        RETURN QUERY SELECT 400, 'pack_5'::TEXT;
    ELSE
        -- Individual: $1 each
        RETURN QUERY SELECT (photo_count * 100), 'single'::TEXT;
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- get_photographer_earnings: Get total earnings for a photographer in a period
CREATE OR REPLACE FUNCTION public.get_photographer_earnings(
    p_photographer_id UUID,
    p_start_date TIMESTAMPTZ DEFAULT NULL,
    p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
    total_earnings_cents BIGINT,
    total_sales INTEGER,
    photo_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(SUM(ti.photographer_amount_cents), 0)::BIGINT,
        COUNT(DISTINCT ti.id)::INTEGER,
        COUNT(DISTINCT ti.photo_id)::INTEGER
    FROM public.transaction_items ti
    JOIN public.transactions t ON ti.transaction_id = t.id
    WHERE ti.photographer_id = p_photographer_id
      AND t.status = 'completed'
      AND (p_start_date IS NULL OR t.completed_at >= p_start_date)
      AND (p_end_date IS NULL OR t.completed_at <= p_end_date);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- search_photos_by_bib: Optimized search function
CREATE OR REPLACE FUNCTION public.search_photos_by_bib(
    p_bib_number TEXT,
    p_event_id UUID DEFAULT NULL,
    p_sort TEXT DEFAULT 'quality',
    p_limit INTEGER DEFAULT 50,
    p_cursor TEXT DEFAULT NULL
)
RETURNS TABLE (
    photo_id UUID,
    event_id UUID,
    event_name TEXT,
    event_date DATE,
    event_location TEXT,
    watermarked_url TEXT,
    thumbnail_url TEXT,
    quality_score DECIMAL(3,2),
    price_cents INTEGER,
    bib_confidence DECIMAL(3,2),
    photographer_id UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        v.photo_id,
        v.event_id,
        v.event_name,
        v.event_date,
        v.event_location,
        v.watermarked_url,
        v.thumbnail_url,
        v.quality_score,
        v.price_cents,
        v.bib_confidence,
        v.photographer_id
    FROM public.v_photo_search v
    WHERE v.bib_number = p_bib_number
      AND (p_event_id IS NULL OR v.event_id = p_event_id)
    ORDER BY
        CASE WHEN p_sort = 'quality' THEN v.quality_score END DESC NULLS LAST,
        CASE WHEN p_sort = 'recent' THEN v.event_date END DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.calculate_transaction_splits TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.calculate_bundle_price TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_photographer_earnings TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_photos_by_bib TO anon, authenticated;
