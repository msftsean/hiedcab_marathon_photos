-- Migration: transactions table
-- Purchase records

CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID REFERENCES public.user_profiles(id),
    buyer_email TEXT NOT NULL,
    stripe_payment_intent_id TEXT NOT NULL UNIQUE,
    stripe_checkout_session_id TEXT UNIQUE,
    amount_cents INTEGER NOT NULL,
    platform_fee_cents INTEGER NOT NULL,
    photographer_amount_cents INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'usd',
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'completed', 'refunded', 'disputed', 'failed')),
    refund_amount_cents INTEGER DEFAULT 0,
    dispute_status TEXT CHECK (dispute_status IN ('needs_response', 'under_review', 'won', 'lost')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON public.transactions(buyer_id)
    WHERE buyer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_email ON public.transactions(buyer_email);
CREATE INDEX IF NOT EXISTS idx_transactions_stripe_pi ON public.transactions(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON public.transactions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Buyers can read their own transactions (by buyer_id)
CREATE POLICY "Buyers can view own transactions by id"
    ON public.transactions
    FOR SELECT
    USING (buyer_id = auth.uid());

-- Service role can do everything (for webhooks)
CREATE POLICY "Service role full access"
    ON public.transactions
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Trigger for updated_at
CREATE TRIGGER trigger_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
