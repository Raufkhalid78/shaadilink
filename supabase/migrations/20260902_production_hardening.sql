-- ==============================================================================
-- SHAADILINK PRODUCTION READINESS & SECURITY HARDENING MIGRATION
-- Migration Date: 2026-09-02
-- Compatibility: Live PostgreSQL / Supabase, Idempotent (Safe to run multiple times)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. SCHEMA EVOLUTION / COLUMN EXTENSIONS (IF NOT EXISTS)
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS guest_links_quota INTEGER DEFAULT 10;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS custom_verse_text TEXT;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS custom_verse_source TEXT;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS host_bride_family TEXT;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS host_groom_family TEXT;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS host_bride_city TEXT;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS host_groom_city TEXT;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS is_segregated BOOLEAN DEFAULT FALSE;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS venue_details_segregated TEXT;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS show_nikah_registration BOOLEAN DEFAULT FALSE;

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracker TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS target_guest_links_quota INTEGER DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS promo_code TEXT;

-- 3. ENSURE ALL TABLES EXIST
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invitation_id UUID REFERENCES public.invitations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  date TEXT,
  time TEXT,
  venue TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.guest_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invitation_id UUID REFERENCES public.invitations(id) ON DELETE CASCADE NOT NULL,
  guest_name TEXT NOT NULL,
  guest_slug TEXT NOT NULL,
  phone TEXT,
  passcode TEXT,
  view_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  last_viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT guest_links_slug_inv_unique UNIQUE(invitation_id, guest_slug)
);

CREATE TABLE IF NOT EXISTS public.rsvps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invitation_id UUID REFERENCES public.invitations(id) ON DELETE CASCADE NOT NULL,
  guest_name TEXT NOT NULL,
  guest_email TEXT,
  status TEXT NOT NULL,
  attending_count INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wishes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invitation_id UUID REFERENCES public.invitations(id) ON DELETE CASCADE NOT NULL,
  sender_name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.referral_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  code TEXT UNIQUE NOT NULL,
  discount_percent NUMERIC DEFAULT 10,
  commission_percent NUMERIC DEFAULT 10,
  max_uses INTEGER DEFAULT 100,
  current_uses INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.affiliate_commissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  commission_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.affiliate_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  social_id TEXT,
  promotion_plan TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.invitation_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invitation_id UUID REFERENCES public.invitations(id) ON DELETE CASCADE NOT NULL,
  viewer_ip TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PERFORMANCE & UNIQUENESS INDEXES
CREATE INDEX IF NOT EXISTS idx_invitations_slug ON public.invitations(slug);
CREATE INDEX IF NOT EXISTS idx_invitations_user_id ON public.invitations(user_id);
CREATE INDEX IF NOT EXISTS idx_invitations_is_active ON public.invitations(is_active);

CREATE INDEX IF NOT EXISTS idx_orders_tracker ON public.orders(tracker);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_invitation_id ON public.orders(invitation_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

CREATE INDEX IF NOT EXISTS idx_events_invitation_id ON public.events(invitation_id);
CREATE INDEX IF NOT EXISTS idx_guest_links_invitation_id ON public.guest_links(invitation_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_invitation_id ON public.rsvps(invitation_id);
CREATE INDEX IF NOT EXISTS idx_wishes_invitation_id ON public.wishes(invitation_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_invitation_views_composite ON public.invitation_views(invitation_id, viewed_at);

-- 5. ATOMIC DATABASE FUNCTIONS & HARDENED RPCS
CREATE OR REPLACE FUNCTION public.increment_view_count(inv_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.invitations
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = inv_id;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_view_count(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_view_count(UUID) TO authenticated, service_role, anon;

CREATE OR REPLACE FUNCTION public.increment_promo_usage(code_val TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.referral_codes
  SET current_uses = COALESCE(current_uses, 0) + 1
  WHERE LOWER(code) = LOWER(code_val);
END;
$$;

REVOKE ALL ON FUNCTION public.increment_promo_usage(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_promo_usage(TEXT) TO authenticated, service_role;

-- Complete Atomic Order Fulfillment Transaction Function
CREATE OR REPLACE FUNCTION public.fulfill_order_atomic(p_order_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order RECORD;
  v_ref_user UUID;
  v_result JSONB;
BEGIN
  -- 1. Row Lock on orders to prevent race conditions & duplicate webhooks
  SELECT * INTO v_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order not found');
  END IF;

  IF v_order.status = 'paid' THEN
    RETURN jsonb_build_object('success', true, 'status', 'already_paid');
  END IF;

  -- 2. Mark order as paid atomically
  UPDATE public.orders
  SET status = 'paid',
      paid_at = NOW()
  WHERE id = p_order_id;

  -- 3. Activate invitation and update plan + quota
  UPDATE public.invitations
  SET is_active = TRUE,
      plan = v_order.plan,
      guest_links_quota = CASE 
        WHEN COALESCE(v_order.target_guest_links_quota, 0) > 0 THEN v_order.target_guest_links_quota 
        ELSE guest_links_quota 
      END
  WHERE id = v_order.invitation_id;

  -- 4. Update profile plan
  IF v_order.user_id IS NOT NULL THEN
    UPDATE public.profiles
    SET plan = v_order.plan
    WHERE id = v_order.user_id;
  END IF;

  -- 5. Atomically increment promo usage and credit affiliate
  IF v_order.promo_code IS NOT NULL AND TRIM(v_order.promo_code) <> '' THEN
    UPDATE public.referral_codes
    SET current_uses = COALESCE(current_uses, 0) + 1
    WHERE LOWER(code) = LOWER(TRIM(v_order.promo_code))
    RETURNING user_id INTO v_ref_user;

    IF v_ref_user IS NOT NULL THEN
      INSERT INTO public.affiliate_commissions (
        affiliate_id,
        order_id,
        referral_code,
        commission_amount,
        status
      ) VALUES (
        v_ref_user,
        v_order.id,
        v_order.promo_code,
        ROUND((v_order.amount * 0.10)::NUMERIC, 2),
        'pending'
      );
    END IF;
  END IF;

  RETURN jsonb_build_object('success', true, 'order_id', p_order_id, 'status', 'paid');
END;
$$;

REVOKE ALL ON FUNCTION public.fulfill_order_atomic(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fulfill_order_atomic(UUID) TO service_role;

-- 6. HARDENED ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_commissions ENABLE ROW LEVEL SECURITY;

-- Invitations RLS
DROP POLICY IF EXISTS "Public can view active invitations" ON public.invitations;
CREATE POLICY "Public can view active invitations" ON public.invitations
  FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Users can view own invitations" ON public.invitations;
CREATE POLICY "Users can view own invitations" ON public.invitations
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own invitations" ON public.invitations;
CREATE POLICY "Users can insert own invitations" ON public.invitations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own invitations" ON public.invitations;
CREATE POLICY "Users can update own invitations" ON public.invitations
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own invitations" ON public.invitations;
CREATE POLICY "Users can delete own invitations" ON public.invitations
  FOR DELETE USING (auth.uid() = user_id);

-- Guest links RLS
DROP POLICY IF EXISTS "Invitation owners can manage guest links" ON public.guest_links;
CREATE POLICY "Invitation owners can manage guest links" ON public.guest_links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.invitations
      WHERE invitations.id = guest_links.invitation_id
        AND invitations.user_id = auth.uid()
    )
  );

-- RSVPs RLS
DROP POLICY IF EXISTS "Public can insert rsvps" ON public.rsvps;
CREATE POLICY "Public can insert rsvps" ON public.rsvps
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.invitations
      WHERE invitations.id = rsvps.invitation_id
        AND invitations.is_active = TRUE
    )
  );

DROP POLICY IF EXISTS "Invitation owners can view rsvps" ON public.rsvps;
CREATE POLICY "Invitation owners can view rsvps" ON public.rsvps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.invitations
      WHERE invitations.id = rsvps.invitation_id
        AND invitations.user_id = auth.uid()
    )
  );

-- Wishes RLS
DROP POLICY IF EXISTS "Public can insert wishes" ON public.wishes;
CREATE POLICY "Public can insert wishes" ON public.wishes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.invitations
      WHERE invitations.id = wishes.invitation_id
        AND invitations.is_active = TRUE
    )
  );

DROP POLICY IF EXISTS "Public can view wishes for active invitations" ON public.wishes;
CREATE POLICY "Public can view wishes for active invitations" ON public.wishes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.invitations
      WHERE invitations.id = wishes.invitation_id
        AND (invitations.is_active = TRUE OR invitations.user_id = auth.uid())
    )
  );

-- Referral codes RLS
DROP POLICY IF EXISTS "Users can view own referral codes" ON public.referral_codes;
CREATE POLICY "Users can view own referral codes" ON public.referral_codes
  FOR SELECT USING (auth.uid() = user_id);

-- 7. STORAGE BUCKET CONFIGURATION
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'invitation-images',
  'invitation-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'];

-- Storage RLS Policies
DROP POLICY IF EXISTS "Public can view invitation images" ON storage.objects;
CREATE POLICY "Public can view invitation images" ON storage.objects
  FOR SELECT USING (bucket_id = 'invitation-images');

DROP POLICY IF EXISTS "Authenticated users can upload invitation images" ON storage.objects;
CREATE POLICY "Authenticated users can upload invitation images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'invitation-images'
    AND auth.role() = 'authenticated'
  );
