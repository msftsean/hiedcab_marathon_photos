-- Migration: database views
-- Optimized views for common queries

-- v_photo_search: Optimized view for bib number search results
CREATE OR REPLACE VIEW public.v_photo_search AS
SELECT
    pb.bib_number,
    p.id AS photo_id,
    p.event_id,
    e.name AS event_name,
    e.date AS event_date,
    e.location AS event_location,
    p.watermarked_url,
    p.thumbnail_url,
    p.quality_score,
    p.price_cents,
    pb.confidence AS bib_confidence,
    p.photographer_id
FROM public.photo_bibs pb
JOIN public.photos p ON pb.photo_id = p.id
JOIN public.events e ON p.event_id = e.id
WHERE p.is_visible = TRUE
  AND p.ocr_status = 'completed'
  AND pb.confidence >= 0.6;

-- v_photographer_dashboard: Aggregated data for photographer dashboard
CREATE OR REPLACE VIEW public.v_photographer_dashboard AS
SELECT
    up.id AS photographer_id,
    up.display_name,
    COUNT(DISTINCT p.id) AS total_photos,
    COUNT(DISTINCT CASE WHEN p.ocr_status = 'completed' THEN p.id END) AS searchable_photos,
    COUNT(DISTINCT CASE WHEN p.ocr_status = 'failed' OR p.ocr_status = 'manual_review' THEN p.id END) AS photos_needing_review,
    COALESCE(SUM(ti.photographer_amount_cents), 0)::BIGINT AS total_earnings_cents,
    COUNT(DISTINCT ti.id)::INTEGER AS total_sales,
    COALESCE(SUM(CASE WHEN t.created_at >= NOW() - INTERVAL '30 days' THEN ti.photographer_amount_cents END), 0)::BIGINT AS earnings_last_30_days,
    COUNT(DISTINCT CASE WHEN t.created_at >= NOW() - INTERVAL '30 days' THEN ti.id END)::INTEGER AS sales_last_30_days
FROM public.user_profiles up
LEFT JOIN public.photos p ON up.id = p.photographer_id
LEFT JOIN public.transaction_items ti ON p.id = ti.photo_id
LEFT JOIN public.transactions t ON ti.transaction_id = t.id AND t.status = 'completed'
WHERE up.role = 'photographer'
GROUP BY up.id, up.display_name;

-- Grant access to views (views inherit RLS from underlying tables)
GRANT SELECT ON public.v_photo_search TO anon, authenticated;
GRANT SELECT ON public.v_photographer_dashboard TO authenticated;
