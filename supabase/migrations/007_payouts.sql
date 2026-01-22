-- Migration: payouts table
-- Photographer payout records

CREATE TABLE IF NOT EXISTS public.payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    photographer_id UUID NOT NULL REFERENCES public.user_profiles(id),
    stripe_transfer_id TEXT UNIQUE,
    amount_cents INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'usd',
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'in_transit', 'paid', 'failed', 'canceled')),
    failure_reason TEXT,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    transaction_count INTEGER NOT NULL,
    initiated_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payouts_photographer ON public.payouts(photographer_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON public.payouts(status);
CREATE INDEX IF NOT EXISTS idx_payouts_period ON public.payouts(photographer_id, period_start, period_end);

-- Enable Row Level Security
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Photographers can read their own payouts
CREATE POLICY "Photographers can view own payouts"
    ON public.payouts
    FOR SELECT
    USING (photographer_id = auth.uid());

-- Service role can do everything (for payout processing)
CREATE POLICY "Service role full access to payouts"
    ON public.payouts
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Trigger for updated_at
CREATE TRIGGER trigger_payouts_updated_at
    BEFORE UPDATE ON public.payouts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
