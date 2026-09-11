-- ==============================================================================
-- SMART INVITES (smartinvites.com.pk) — SAFE NON-DESTRUCTIVE SCHEMA EVOLUTION
-- Migration Name: 20260910_features_and_functions_schema.sql
-- Compatibility: PostgreSQL 14+ / Supabase
-- Safety Guarantee: 100% Idempotent, Safe to run multiple times, 
--                   NEVER drops tables, NEVER drops columns, NEVER clears existing data.
-- ==============================================================================

-- ─── 1. EXTENSIONS ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── 2. INVITATIONS TABLE ENHANCEMENTS ────────────────────────────────────────
-- Core fields for multi-category events (Weddings, Corporate, Birthday, School)
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'wedding';
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS guest_links_quota INTEGER DEFAULT 10;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS personalized_guest_links BOOLEAN DEFAULT FALSE;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS youtube_video_id TEXT;

-- Custom Audio & Music (Royal Tier)
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS custom_music_url TEXT;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS custom_music_name TEXT;

-- Digital Shagun & Registry Controls
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS hide_digital_shagun BOOLEAN DEFAULT FALSE;

-- Islamic & Religious Opening Verses
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS show_bismillah BOOLEAN DEFAULT TRUE;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS show_quran_verse BOOLEAN DEFAULT TRUE;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS custom_verse_text TEXT;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS custom_verse_source TEXT;

-- Pakistani Tradition & Event Fields
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS host_bride_family TEXT;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS host_groom_family TEXT;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS host_bride_city TEXT;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS host_groom_city TEXT;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS is_segregated BOOLEAN DEFAULT FALSE;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS venue_details_segregated TEXT;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS show_nikah_registration BOOLEAN DEFAULT FALSE;

-- Agency & Event Planner White-Labeling
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS agency_name TEXT;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS white_label_footer TEXT;

-- Builder Draft & Step State
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS current_step INTEGER DEFAULT 1;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS last_saved_step INTEGER DEFAULT 1;

-- Ensure unique constraint on slug if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'invitations_slug_unique'
  ) THEN
    ALTER TABLE public.invitations ADD CONSTRAINT invitations_slug_unique UNIQUE (slug);
  END IF;
EXCEPTION
  WHEN duplicate_table OR duplicate_object THEN NULL;
END $$;

-- ─── 3. GUEST LINKS & VIP PASSES TABLE ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.guest_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  guest_slug TEXT NOT NULL,
  url TEXT NOT NULL,
  allowed_events TEXT[],
  seats INTEGER DEFAULT 1,
  status TEXT DEFAULT 'pending',
  view_count INTEGER DEFAULT 0,
  phone TEXT,
  passcode TEXT,
  table_number TEXT,
  notes TEXT,
  qr_code_url TEXT,
  checked_in_at TIMESTAMPTZ,
  last_viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT guest_links_invitation_slug_unique UNIQUE(invitation_id, guest_slug)
);

-- Ensure all guest_links columns exist if the table was created previously
ALTER TABLE public.guest_links ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.guest_links ADD COLUMN IF NOT EXISTS allowed_events TEXT[];
ALTER TABLE public.guest_links ADD COLUMN IF NOT EXISTS seats INTEGER DEFAULT 1;
ALTER TABLE public.guest_links ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE public.guest_links ADD COLUMN IF NOT EXISTS last_viewed_at TIMESTAMPTZ;
ALTER TABLE public.guest_links ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.guest_links ADD COLUMN IF NOT EXISTS passcode TEXT;
ALTER TABLE public.guest_links ADD COLUMN IF NOT EXISTS table_number TEXT;
ALTER TABLE public.guest_links ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.guest_links ADD COLUMN IF NOT EXISTS qr_code_url TEXT;
ALTER TABLE public.guest_links ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ;

-- Safely update status check constraint to include 'checked_in'
DO $$
BEGIN
  -- Drop older restrictive constraint if it exists
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'guest_links_status_check') THEN
    ALTER TABLE public.guest_links DROP CONSTRAINT guest_links_status_check;
  END IF;
  
  -- Add comprehensive status check constraint
  ALTER TABLE public.guest_links ADD CONSTRAINT guest_links_status_check 
    CHECK (status IN ('pending', 'sent', 'opened', 'rsvp_accept', 'rsvp_decline', 'checked_in'));
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- ─── 4. REVIEWS & TESTIMONIALS TABLE ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID REFERENCES public.invitations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  message TEXT NOT NULL,
  template_name TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all reviews columns exist if table was already created
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS template_name TEXT;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS rating INTEGER;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS message TEXT;

-- ─── 5. SITE SETTINGS TABLE ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email TEXT NOT NULL DEFAULT 'info@smartinvites.com.pk',
  maintenance_mode BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist on site_settings if already created
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS admin_email TEXT DEFAULT 'info@smartinvites.com.pk';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS maintenance_mode BOOLEAN DEFAULT FALSE;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Seed site_settings row safely ONLY if the table is currently empty
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.site_settings LIMIT 1) THEN
    INSERT INTO public.site_settings (admin_email, maintenance_mode)
    VALUES ('info@smartinvites.com.pk', FALSE);
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- ─── 6. PROFILES TABLE ENHANCEMENTS ──────────────────────────────────────────
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS agency_name TEXT;

-- ─── 7. ORDERS TABLE ENHANCEMENTS ────────────────────────────────────────────
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracker TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS target_guest_links_quota INTEGER DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS promo_code TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- ─── 8. AFFILIATE COMMISSIONS TABLE ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.affiliate_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  commission_amount NUMERIC(10, 2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist on affiliate_commissions if table was already created
ALTER TABLE public.affiliate_commissions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.affiliate_commissions ADD COLUMN IF NOT EXISTS commission_amount NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.affiliate_commissions ADD COLUMN IF NOT EXISTS referral_code TEXT;

-- ─── 9. INVITATION VIEWS (TIME-SERIES ANALYTICS) ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.invitation_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 10. ATOMIC RPC FUNCTIONS ────────────────────────────────────────────────
-- Atomically increment views and log timestamp
CREATE OR REPLACE FUNCTION public.increment_view_count(inv_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.invitations
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = inv_id;
  
  INSERT INTO public.invitation_views (invitation_id, viewed_at)
  VALUES (inv_id, NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomically increment promo code usage count
CREATE OR REPLACE FUNCTION public.increment_promo_usage(code_val TEXT)
RETURNS void AS $$
BEGIN
  UPDATE public.referral_codes
  SET current_uses = current_uses + 1
  WHERE code = code_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── 11. ROW LEVEL SECURITY (RLS) POLICIES ───────────────────────────────────
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitation_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_commissions ENABLE ROW LEVEL SECURITY;

-- Reviews policies
DROP POLICY IF EXISTS "reviews_select_approved_public" ON public.reviews;
CREATE POLICY "reviews_select_approved_public" ON public.reviews
  FOR SELECT USING (is_approved = TRUE OR auth.uid() = user_id);

DROP POLICY IF EXISTS "reviews_insert_authenticated" ON public.reviews;
CREATE POLICY "reviews_insert_authenticated" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Site Settings policies (Public can check maintenance mode, service role can update)
DROP POLICY IF EXISTS "site_settings_select_public" ON public.site_settings;
CREATE POLICY "site_settings_select_public" ON public.site_settings
  FOR SELECT USING (TRUE);

-- Guest Links policies
DROP POLICY IF EXISTS "guest_links_select_owner_or_public" ON public.guest_links;
CREATE POLICY "guest_links_select_owner_or_public" ON public.guest_links
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "guest_links_owner_crud" ON public.guest_links;
CREATE POLICY "guest_links_owner_crud" ON public.guest_links
  FOR ALL USING (
    invitation_id IN (SELECT id FROM public.invitations WHERE user_id = auth.uid())
  );

-- Affiliate commissions policies
DROP POLICY IF EXISTS "affiliate_commissions_select_owner" ON public.affiliate_commissions;
CREATE POLICY "affiliate_commissions_select_owner" ON public.affiliate_commissions
  FOR SELECT USING (auth.uid() = affiliate_id);

-- ─── 12. PERFORMANCE INDEXES ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_invitations_slug ON public.invitations(slug);
CREATE INDEX IF NOT EXISTS idx_invitations_user_id ON public.invitations(user_id);
CREATE INDEX IF NOT EXISTS idx_invitations_category ON public.invitations(category);
CREATE INDEX IF NOT EXISTS idx_guest_links_inv_slug ON public.guest_links(invitation_id, guest_slug);
CREATE INDEX IF NOT EXISTS idx_guest_links_status ON public.guest_links(status);
CREATE INDEX IF NOT EXISTS idx_reviews_invitation_id ON public.reviews(invitation_id);
CREATE INDEX IF NOT EXISTS idx_reviews_is_approved ON public.reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_tracker ON public.orders(tracker);
CREATE INDEX IF NOT EXISTS idx_invitation_views_inv_id ON public.invitation_views(invitation_id);

-- ==============================================================================
-- END OF MIGRATION — All features, tables, columns, indexes, and RLS are synchronized.
-- ==============================================================================
