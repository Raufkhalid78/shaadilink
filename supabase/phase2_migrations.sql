-- ============================================================
-- Phase 2 & 3 Migrations
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Abandoned Checkout Reminder
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ;

-- 2. Invitation Views (Time-series analytics)
CREATE TABLE IF NOT EXISTS public.invitation_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- RPC for incrementing views atomically and logging time-series data
CREATE OR REPLACE FUNCTION public.increment_view_count(inv_id UUID)
RETURNS void AS $$
BEGIN
  -- Increment the main counter
  UPDATE public.invitations
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = inv_id;
  
  -- Log the view
  INSERT INTO public.invitation_views (invitation_id, viewed_at)
  VALUES (inv_id, NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Guest Links (For personalized links & tracking)
CREATE TABLE IF NOT EXISTS public.guest_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  guest_slug TEXT NOT NULL,
  url TEXT NOT NULL,
  allowed_events TEXT[],
  seats INTEGER DEFAULT 1,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'opened', 'rsvp_accept', 'rsvp_decline')),
  view_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(invitation_id, guest_slug)
);

-- 4. Referral Codes
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  discount_percent INTEGER NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
  max_uses INTEGER DEFAULT 0, -- 0 means unlimited
  current_uses INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Apply RLS policies to new tables
ALTER TABLE public.invitation_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

-- Owner policies
CREATE POLICY "invitation_views_select_owner" ON public.invitation_views FOR SELECT USING (
  invitation_id IN (SELECT id FROM public.invitations WHERE user_id = auth.uid())
);

CREATE POLICY "guest_links_select_owner" ON public.guest_links FOR SELECT USING (
  invitation_id IN (SELECT id FROM public.invitations WHERE user_id = auth.uid())
);
CREATE POLICY "guest_links_insert_owner" ON public.guest_links FOR INSERT WITH CHECK (
  invitation_id IN (SELECT id FROM public.invitations WHERE user_id = auth.uid())
);
CREATE POLICY "guest_links_update_owner" ON public.guest_links FOR UPDATE USING (
  invitation_id IN (SELECT id FROM public.invitations WHERE user_id = auth.uid())
);
CREATE POLICY "guest_links_delete_owner" ON public.guest_links FOR DELETE USING (
  invitation_id IN (SELECT id FROM public.invitations WHERE user_id = auth.uid())
);

-- Public can read a guest link by token (if needed)
CREATE POLICY "guest_links_select_public_token" ON public.guest_links FOR SELECT USING (TRUE);
-- Public can update guest links implicitly when opening them (RPC or similar can bypass RLS, but if they use anon key, maybe an update policy is needed. We'll handle it via an RPC or server-side).

-- Referral codes policies
CREATE POLICY "referral_codes_select_public" ON public.referral_codes FOR SELECT USING (TRUE);
CREATE POLICY "referral_codes_select_owner" ON public.referral_codes FOR ALL USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.increment_promo_usage(code_val TEXT)
RETURNS void AS $$
BEGIN
  UPDATE public.referral_codes
  SET current_uses = current_uses + 1
  WHERE code = code_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Add uniqueness constraint for RSVPs to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS rsvps_invitation_identity_idx ON public.rsvps (invitation_id, COALESCE(guest_email, guest_name));