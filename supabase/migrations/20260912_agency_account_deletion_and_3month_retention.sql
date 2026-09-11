-- ==========================================================
-- Migration: Agency Account Deletion & 3-Month Retention Safeguard
-- Date: 2026-09-12
-- Ensures active client invitations remain accessible via links for 3 months (90 days)
-- ==========================================================

-- 1. Add auto_delete_at column to invitations table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'invitations') THEN
    ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS auto_delete_at TIMESTAMPTZ;
    ALTER TABLE public.invitations ALTER COLUMN user_id DROP NOT NULL;
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- 2. Safely update invitations foreign key to ON DELETE SET NULL
-- This prevents CASCADE deletion from taking down live client wedding invitations
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'invitations') THEN
    ALTER TABLE public.invitations DROP CONSTRAINT IF EXISTS invitations_user_id_fkey;
    ALTER TABLE public.invitations ADD CONSTRAINT invitations_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- 3. Add deletion request fields to agency_applications
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'agency_applications') THEN
    ALTER TABLE public.agency_applications ADD COLUMN IF NOT EXISTS deletion_requested BOOLEAN DEFAULT false;
    ALTER TABLE public.agency_applications ADD COLUMN IF NOT EXISTS deletion_requested_at TIMESTAMPTZ;
    ALTER TABLE public.agency_applications ADD COLUMN IF NOT EXISTS deletion_reason TEXT;
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;
