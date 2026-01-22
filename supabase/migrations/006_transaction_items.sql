-- Migration: transaction_items table
-- Line items for each transaction (photos purchased)

CREATE TABLE IF NOT EXISTS public.transaction_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    photo_id UUID NOT NULL REFERENCES public.photos(id),
    photographer_id UUID NOT NULL REFERENCES public.user_profiles(id),
    price_cents INTEGER NOT NULL,
    photographer_amount_cents INTEGER NOT NULL,
    download_url TEXT,
    download_count INTEGER DEFAULT 0,
    download_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction ON public.transaction_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_items_photo ON public.transaction_items(photo_id);
CREATE INDEX IF NOT EXISTS idx_transaction_items_photographer ON public.transaction_items(photographer_id);

-- Enable Row Level Security
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Buyers can read their own transaction items
CREATE POLICY "Buyers can view own transaction items"
    ON public.transaction_items
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.transactions
            WHERE transactions.id = transaction_items.transaction_id
            AND transactions.buyer_id = auth.uid()
        )
    );

-- Photographers can read items for their photos
CREATE POLICY "Photographers can view items for own photos"
    ON public.transaction_items
    FOR SELECT
    USING (photographer_id = auth.uid());

-- Service role can do everything (for webhooks)
CREATE POLICY "Service role full access to items"
    ON public.transaction_items
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Trigger to increment purchase count on photos
CREATE OR REPLACE FUNCTION increment_purchase_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.photos
    SET purchase_count = purchase_count + 1,
        updated_at = NOW()
    WHERE id = NEW.photo_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_increment_purchase_count
    AFTER INSERT ON public.transaction_items
    FOR EACH ROW
    EXECUTE FUNCTION increment_purchase_count();
