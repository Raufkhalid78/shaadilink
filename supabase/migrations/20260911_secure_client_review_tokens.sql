-- Migration: Secure Client Review Tokens & View Limits
-- Adds secure random token, view counting, and view limits to prevent unauthorized sharing of draft invitations.

ALTER TABLE public.invitations
ADD COLUMN IF NOT EXISTS review_token VARCHAR(32),
ADD COLUMN IF NOT EXISTS review_views_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS review_max_views INTEGER DEFAULT 7,
ADD COLUMN IF NOT EXISTS review_expires_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_invitations_review_token ON public.invitations(review_token);

COMMENT ON COLUMN public.invitations.review_token IS 'Short 7-9 character secure random token for confidential client review';
COMMENT ON COLUMN public.invitations.review_views_count IS 'Number of distinct client view sessions consumed';
COMMENT ON COLUMN public.invitations.review_max_views IS 'Maximum views allowed before the review link automatically expires (default 7)';
