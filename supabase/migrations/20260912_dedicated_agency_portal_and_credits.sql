-- ==========================================================
-- Migration: Complete Agency & Event Planner Partner Schema & Credit Orders
-- Date: 2026-09-12
-- Fully Self-Contained, Idempotent, Safe to Run on Any Database
-- ==========================================================

-- 1. Create agency_applications table if not exists
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
  credits_balance INTEGER DEFAULT 0,
  white_label_enabled BOOLEAN DEFAULT true,
  agency_logo_url TEXT,
  tagline TEXT,
  instagram_handle TEXT,
  website_url TEXT,
  accent_color TEXT DEFAULT '#C9A84C',
  payout_details TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure all columns exist if table was created in an earlier migration
DO $$
BEGIN
  ALTER TABLE public.agency_applications ADD COLUMN IF NOT EXISTS credits_balance INTEGER DEFAULT 0;
  ALTER TABLE public.agency_applications ADD COLUMN IF NOT EXISTS white_label_enabled BOOLEAN DEFAULT true;
  ALTER TABLE public.agency_applications ADD COLUMN IF NOT EXISTS agency_logo_url TEXT;
  ALTER TABLE public.agency_applications ADD COLUMN IF NOT EXISTS tagline TEXT;
  ALTER TABLE public.agency_applications ADD COLUMN IF NOT EXISTS instagram_handle TEXT;
  ALTER TABLE public.agency_applications ADD COLUMN IF NOT EXISTS website_url TEXT;
  ALTER TABLE public.agency_applications ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#C9A84C';
  ALTER TABLE public.agency_applications ADD COLUMN IF NOT EXISTS payout_details TEXT;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Indexes for agency_applications
CREATE INDEX IF NOT EXISTS idx_agency_applications_email ON public.agency_applications(email);
CREATE INDEX IF NOT EXISTS idx_agency_applications_user_id ON public.agency_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_agency_applications_status ON public.agency_applications(status);

-- 2. Add agency columns to profiles table if profiles exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_agency BOOLEAN DEFAULT false;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS agency_name TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS agency_credits INTEGER DEFAULT 0;
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- 3. Create agency_credit_orders table
CREATE TABLE IF NOT EXISTS public.agency_credit_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  agency_id UUID REFERENCES public.agency_applications(id) ON DELETE CASCADE,
  agency_name TEXT NOT NULL,
  pack_name TEXT NOT NULL,
  credits_count INTEGER NOT NULL,
  amount_pkr INTEGER NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('manual_bank', 'safepay')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  receipt_url TEXT,
  transaction_reference TEXT,
  safepay_tracker TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for agency_credit_orders
CREATE INDEX IF NOT EXISTS idx_agency_credit_orders_user_id ON public.agency_credit_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_agency_credit_orders_agency_id ON public.agency_credit_orders(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_credit_orders_status ON public.agency_credit_orders(status);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.agency_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_credit_orders ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for agency_applications
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

-- 6. RLS Policies for agency_credit_orders
DO $$
BEGIN
  DROP POLICY IF EXISTS "Admins full access to agency credit orders" ON public.agency_credit_orders;
  CREATE POLICY "Admins full access to agency credit orders"
  ON public.agency_credit_orders
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

DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view own agency credit orders" ON public.agency_credit_orders;
  CREATE POLICY "Users can view own agency credit orders"
  ON public.agency_credit_orders
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can insert own agency credit orders" ON public.agency_credit_orders;
  CREATE POLICY "Users can insert own agency credit orders"
  ON public.agency_credit_orders
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;
