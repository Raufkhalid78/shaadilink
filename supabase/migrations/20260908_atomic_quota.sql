-- Migration: Add atomic function for bulk guest links insertion

CREATE OR REPLACE FUNCTION insert_guest_links_atomic(
  p_invitation_id UUID,
  p_user_id UUID,
  p_guests JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_quota INT;
  v_current_count INT;
  v_guest_count INT;
  v_inserted JSONB;
BEGIN
  -- 1. Lock the invitation row and get quota (ensure it belongs to user)
  SELECT guest_links_quota INTO v_quota
  FROM invitations
  WHERE id = p_invitation_id AND user_id = p_user_id AND is_active = true
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invitation not found, unauthorized, or not active.';
  END IF;

  -- 2. Count the number of guests in the JSON payload
  v_guest_count := jsonb_array_length(p_guests);
  IF v_guest_count > 500 THEN
    RAISE EXCEPTION 'Maximum batch size is 500 guests.';
  END IF;

  -- 3. Get the current number of guest links
  SELECT COUNT(*) INTO v_current_count
  FROM guest_links
  WHERE invitation_id = p_invitation_id;

  -- 4. Check quota atomically
  IF v_current_count + v_guest_count > v_quota THEN
    RAISE EXCEPTION 'Quota exceeded. Cannot create % links. Only % remaining.', v_guest_count, (v_quota - v_current_count);
  END IF;

  -- 5. Perform the bulk insert
  WITH inserted_rows AS (
    INSERT INTO guest_links (invitation_id, guest_name, guest_slug, url, allowed_events, seats)
    SELECT 
      p_invitation_id,
      g->>'guestName',
      g->>'guestSlug',
      g->>'url',
      -- Map JSON array to text[] safely or leave null if empty
      (SELECT array_agg(x::text) FROM jsonb_array_elements_text(g->'allowedEvents') x) AS allowed_events,
      COALESCE((g->>'seats')::int, 1)
    FROM jsonb_array_elements(p_guests) AS g
    RETURNING id, guest_name, guest_slug, url, allowed_events, seats, created_at
  )
  SELECT jsonb_agg(row_to_json(inserted_rows)) INTO v_inserted FROM inserted_rows;

  RETURN COALESCE(v_inserted, '[]'::jsonb);
END;
$$;
