-- ============================================================
-- ShaadiLink — Supabase Schema
-- Run this entire file in the Supabase SQL Editor
-- ============================================================

-- ─── Enable UUID extension ───────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Profiles (auto-created on auth.users insert) ───────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  email       TEXT,
  plan        TEXT DEFAULT 'free',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Invitations ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.invitations (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  template_id           TEXT NOT NULL DEFAULT 'emerald-noir',
  plan                  TEXT NOT NULL DEFAULT 'classic',
  partner1_name         TEXT,
  partner2_name         TEXT,
  venue                 TEXT,
  venue_address         TEXT,
  welcome_message       TEXT,
  background_music      TEXT,
  dress_code_women      TEXT,
  dress_code_men        TEXT,
  transportation        TEXT,
  accommodation         TEXT,
  gifts                 TEXT,
  hero_image_url        TEXT,
  slideshow_image_urls  TEXT[] DEFAULT '{}',
  is_active             BOOLEAN DEFAULT FALSE,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Events (child of invitations) ───────────────────────────
CREATE TABLE IF NOT EXISTS public.events (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitation_id   UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  date            TEXT,
  time            TEXT,
  venue           TEXT,
  order_index     INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── RSVPs ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.rsvps (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitation_id   UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  guest_name      TEXT NOT NULL,
  guest_email     TEXT,
  status          TEXT NOT NULL CHECK (status IN ('accept', 'decline')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Wishes ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.wishes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitation_id   UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  sender_name     TEXT NOT NULL,
  message         TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Orders ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invitation_id   UUID REFERENCES public.invitations(id) ON DELETE SET NULL,
  plan            TEXT NOT NULL,
  amount          NUMERIC(10, 2) NOT NULL,
  currency        TEXT DEFAULT 'PKR',
  status          TEXT DEFAULT 'paid' CHECK (status IN ('pending', 'paid', 'failed')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Affiliate Applications ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.affiliate_applications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  email           TEXT NOT NULL,
  social_id       TEXT,
  promotion_plan  TEXT NOT NULL,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Contact Messages ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  message     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Newsletter Subscribers ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       TEXT UNIQUE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Trigger: auto-create profile on signup ──────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── Trigger: auto-update updated_at ────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_invitations_updated_at ON public.invitations;
CREATE TRIGGER set_invitations_updated_at
  BEFORE UPDATE ON public.invitations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ─── Row-Level Security ───────────────────────────────────────
ALTER TABLE public.profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvps                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishes               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Invitations: owners can do everything
CREATE POLICY "invitations_select_own"  ON public.invitations FOR SELECT  USING (auth.uid() = user_id);
CREATE POLICY "invitations_insert_own"  ON public.invitations FOR INSERT  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "invitations_update_own"  ON public.invitations FOR UPDATE  USING (auth.uid() = user_id);
CREATE POLICY "invitations_delete_own"  ON public.invitations FOR DELETE  USING (auth.uid() = user_id);
-- Public can read active invitations (for the viewer page)
CREATE POLICY "invitations_select_active" ON public.invitations FOR SELECT USING (is_active = TRUE);

-- Events: follow invitation ownership
CREATE POLICY "events_select" ON public.events FOR SELECT USING (
  invitation_id IN (SELECT id FROM public.invitations WHERE user_id = auth.uid() OR is_active = TRUE)
);
CREATE POLICY "events_insert_own" ON public.events FOR INSERT WITH CHECK (
  invitation_id IN (SELECT id FROM public.invitations WHERE user_id = auth.uid())
);
CREATE POLICY "events_update_own" ON public.events FOR UPDATE USING (
  invitation_id IN (SELECT id FROM public.invitations WHERE user_id = auth.uid())
);
CREATE POLICY "events_delete_own" ON public.events FOR DELETE USING (
  invitation_id IN (SELECT id FROM public.invitations WHERE user_id = auth.uid())
);

-- RSVPs: anyone can insert (guests), owner can select all
CREATE POLICY "rsvps_insert_public"  ON public.rsvps FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "rsvps_select_owner"   ON public.rsvps FOR SELECT USING (
  invitation_id IN (SELECT id FROM public.invitations WHERE user_id = auth.uid())
);

-- Wishes: anyone can insert, anyone can read
CREATE POLICY "wishes_insert_public" ON public.wishes FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "wishes_select_public" ON public.wishes FOR SELECT USING (TRUE);

-- Orders: owner only
CREATE POLICY "orders_select_own" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "orders_insert_own" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public submissions
CREATE POLICY "affiliate_insert_public"  ON public.affiliate_applications FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "contact_insert_public"    ON public.contact_messages       FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "newsletter_insert_public" ON public.newsletter_subscribers FOR INSERT WITH CHECK (TRUE);

-- ─── Storage bucket ──────────────────────────────────────────
-- Run in Supabase Storage UI or via SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('invitation-images', 'invitation-images', TRUE)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "invitation_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'invitation-images');

CREATE POLICY "invitation_images_auth_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'invitation-images' AND auth.role() = 'authenticated'
  );

CREATE POLICY "invitation_images_owner_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'invitation-images' AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );
