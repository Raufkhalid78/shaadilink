-- ============================================================
-- Migration: Add show_crowd_photo_wall column to invitations
-- Run this in your Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Paste & Run
-- ============================================================

ALTER TABLE public.invitations
ADD COLUMN IF NOT EXISTS show_crowd_photo_wall BOOLEAN DEFAULT TRUE;

COMMENT ON COLUMN public.invitations.show_crowd_photo_wall IS 'Controls whether guest live crowd photo wall is enabled or hidden';
