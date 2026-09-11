-- ==========================================================
-- Migration: Agency & Event Planner Partner Applications & Profiles
-- Date: 2026-09-10
-- Backwards compatible, non-destructive
-- ==========================================================

-- 1. Create agency_applications table
CREATE TABLE IF NOT EXISTS public.agency_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT,
  website_or_social TEXT,
  monthly_events TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_agency_applications_email ON public.agency_applications(email);
CREATE INDEX IF NOT EXISTS idx_agency_applications_user_id ON public.agency_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_agency_applications_status ON public.agency_applications(status);

-- 2. Add is_agency column to profiles table if not exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_agency BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS agency_name TEXT;
  END IF;
END $$;

-- 3. Row Level Security Policies
ALTER TABLE public.agency_applications ENABLE ROW LEVEL SECURITY;

-- Admins full access policy (drop existing if rerun)
DO $$
BEGIN
  DROP POLICY IF EXISTS "Admins full access to agency applications" ON public.agency_applications;
  CREATE POLICY "Admins full access to agency applications"
  ON public.agency_applications
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Anyone can submit application
DO $$
BEGIN
  DROP POLICY IF EXISTS "Anyone can submit agency application" ON public.agency_applications;
  CREATE POLICY "Anyone can submit agency application"
  ON public.agency_applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Users can view their own application
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view own agency application" ON public.agency_applications;
  CREATE POLICY "Users can view own agency application"
  ON public.agency_applications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR email = auth.jwt()->>'email');
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;
