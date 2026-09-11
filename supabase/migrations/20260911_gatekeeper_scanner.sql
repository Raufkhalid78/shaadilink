-- ============================================================
-- Gatekeeper Scanner Link & PIN Delegation Migration
-- Run this in your Supabase SQL Editor
-- ============================================================

ALTER TABLE public.invitations 
ADD COLUMN IF NOT EXISTS scanner_pin VARCHAR(10),
ADD COLUMN IF NOT EXISTS scanner_active BOOLEAN DEFAULT TRUE;

-- Comment for documentation
COMMENT ON COLUMN public.invitations.scanner_pin IS 'Optional 4-digit PIN for gatekeepers to scan passes without host login';
COMMENT ON COLUMN public.invitations.scanner_active IS 'Whether gatekeeper scanner delegation link is active';
