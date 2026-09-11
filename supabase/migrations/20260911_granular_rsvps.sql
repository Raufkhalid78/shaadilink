-- Migration: Granular Family Headcount & Dietary RSVP Engine
-- Adds multi-guest headcount, dietary restrictions, and multi-ceremony attendance tracking

ALTER TABLE public.rsvps 
ADD COLUMN IF NOT EXISTS adults_count integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS children_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS dietary_notes text DEFAULT '',
ADD COLUMN IF NOT EXISTS attending_events text[] DEFAULT '{}';

-- Index for analytics and catering reporting
CREATE INDEX IF NOT EXISTS idx_rsvps_headcount ON public.rsvps (invitation_id, status, adults_count, children_count);

COMMENT ON COLUMN public.rsvps.adults_count IS 'Total number of adult guests attending in this party';
COMMENT ON COLUMN public.rsvps.children_count IS 'Total number of child guests attending in this party';
COMMENT ON COLUMN public.rsvps.dietary_notes IS 'Dietary restrictions, preferences, or allergies (e.g., Diabetic, Vegetarian, Nut Allergy)';
COMMENT ON COLUMN public.rsvps.attending_events IS 'List of ceremony names or IDs this guest/family will attend';
