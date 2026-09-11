-- ============================================================
-- Manual Bank Transfer & Raast Orders Migration
-- Run this in your Supabase SQL Editor
-- ============================================================

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'safepay',
ADD COLUMN IF NOT EXISTS receipt_url TEXT,
ADD COLUMN IF NOT EXISTS transaction_ref VARCHAR(100),
ADD COLUMN IF NOT EXISTS sender_details TEXT,
ADD COLUMN IF NOT EXISTS rejected_reason TEXT;

-- Comments for documentation
COMMENT ON COLUMN public.orders.payment_method IS 'safepay or manual_bank';
COMMENT ON COLUMN public.orders.receipt_url IS 'Public URL of uploaded bank payment slip/screenshot';
COMMENT ON COLUMN public.orders.transaction_ref IS 'User provided bank transaction reference / STAN / UTR number';
COMMENT ON COLUMN public.orders.sender_details IS 'Sender bank name and account holder name';
COMMENT ON COLUMN public.orders.rejected_reason IS 'Reason if order was rejected by admin';
