-- Migration: Fix SECURITY DEFINER views
-- Changes views to use SECURITY INVOKER to ensure RLS policies are enforced
-- This addresses Supabase Security Advisor warnings

-- Drop and recreate v_photo_search with explicit SECURITY INVOKER
DROP VIEW IF EXISTS public.v_photo_search;

CREATE VIEW public.v_photo_search
WITH (security_invoker = true)
AS
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

-- Drop and recreate v_photographer_dashboard with explicit SECURITY INVOKER
DROP VIEW IF EXISTS public.v_photographer_dashboard;

CREATE VIEW public.v_photographer_dashboard
WITH (security_invoker = true)
AS
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

-- Re-grant access to views
GRANT SELECT ON public.v_photo_search TO anon, authenticated;
GRANT SELECT ON public.v_photographer_dashboard TO authenticated;

COMMENT ON VIEW public.v_photo_search IS 'Optimized view for bib number search results - uses SECURITY INVOKER for RLS compliance';
COMMENT ON VIEW public.v_photographer_dashboard IS 'Aggregated data for photographer dashboard - uses SECURITY INVOKER for RLS compliance';
