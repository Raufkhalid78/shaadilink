-- ============================================================
-- ShaadiLink SQL Migration: Add missing columns
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Add youtube_video_id column to invitations table
ALTER TABLE public.invitations
  ADD COLUMN IF NOT EXISTS youtube_video_id TEXT;

-- Add personalized_guest_links column to invitations table
ALTER TABLE public.invitations
  ADD COLUMN IF NOT EXISTS personalized_guest_links BOOLEAN DEFAULT FALSE;

-- Add custom unique slug column to invitations table
ALTER TABLE public.invitations
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
