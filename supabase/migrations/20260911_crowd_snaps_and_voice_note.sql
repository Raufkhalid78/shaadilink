-- ============================================================
-- Crowd Photo Wall (Guest Snaps), Host Voice Note & Client Review
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Extend invitations table
ALTER TABLE public.invitations
ADD COLUMN IF NOT EXISTS voice_note_url TEXT,
ADD COLUMN IF NOT EXISTS voice_note_title TEXT,
ADD COLUMN IF NOT EXISTS voice_note_sender TEXT,
ADD COLUMN IF NOT EXISTS client_approval_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS client_approval_notes TEXT,
ADD COLUMN IF NOT EXISTS client_approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS agency_phone VARCHAR(50);

COMMENT ON COLUMN public.invitations.voice_note_url IS 'Public audio URL of the hosts personal voice greeting';
COMMENT ON COLUMN public.invitations.voice_note_title IS 'Title or label for the voice note';
COMMENT ON COLUMN public.invitations.voice_note_sender IS 'Name or relation of who recorded the voice note';
COMMENT ON COLUMN public.invitations.client_approval_status IS 'pending, approved, or changes_requested';
COMMENT ON COLUMN public.invitations.client_approval_notes IS 'Notes or change requests left by client during review';
COMMENT ON COLUMN public.invitations.client_approved_at IS 'Timestamp when the client approved the invitation draft';
COMMENT ON COLUMN public.invitations.agency_phone IS 'Agency WhatsApp number associated with this invitation';

-- 2. Create guest_snaps table for live event photo wall
CREATE TABLE IF NOT EXISTS public.guest_snaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  guest_name VARCHAR(150),
  photo_url TEXT NOT NULL,
  caption TEXT,
  table_number VARCHAR(50),
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_guest_snaps_invitation_id ON public.guest_snaps(invitation_id);
CREATE INDEX IF NOT EXISTS idx_guest_snaps_created_at ON public.guest_snaps(created_at DESC);

-- Enable RLS on guest_snaps
ALTER TABLE public.guest_snaps ENABLE ROW LEVEL SECURITY;

-- Allow public to read approved snaps for public invitations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'guest_snaps' AND policyname = 'Public can view approved snaps'
  ) THEN
    CREATE POLICY "Public can view approved snaps"
    ON public.guest_snaps
    FOR SELECT
    USING (is_approved = true);
  END IF;
END $$;

-- Allow public to upload snaps
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'guest_snaps' AND policyname = 'Public can submit snaps'
  ) THEN
    CREATE POLICY "Public can submit snaps"
    ON public.guest_snaps
    FOR INSERT
    WITH CHECK (true);
  END IF;
END $$;

-- Allow invitation owners to update or delete snaps (moderation)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'guest_snaps' AND policyname = 'Owners can moderate snaps'
  ) THEN
    CREATE POLICY "Owners can moderate snaps"
    ON public.guest_snaps
    FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM public.invitations i
        WHERE i.id = guest_snaps.invitation_id
        AND i.user_id = auth.uid()
      )
    );
  END IF;
END $$;
