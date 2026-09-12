-- Migration: Add show_headcount and show_dietary_preferences to invitations table
ALTER TABLE invitations
ADD COLUMN IF NOT EXISTS show_headcount BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS show_dietary_preferences BOOLEAN DEFAULT false;
