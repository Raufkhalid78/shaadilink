import { createServiceClient } from "@/lib/supabase/server";

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

// Global in-memory cache surviving across requests within the server process
const invitationCache = new Map<string, CacheEntry<any>>();
const guestLinkCache = new Map<string, CacheEntry<any>>();

// Cache TTL: 2 minutes (120,000 ms)
const CACHE_TTL_MS = 2 * 60 * 1000;

/**
 * Fetch a public invitation with sub-millisecond memory caching.
 * Uses service role client to bypass cookie parsing overhead.
 */
export async function getCachedPublicInvitation(cleanId: string, isUuid: boolean) {
  const normalizedKey = cleanId.toLowerCase().trim();
  const cached = invitationCache.get(normalizedKey);

  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }

  const supabase = createServiceClient();
  const query = supabase
    .from("invitations")
    .select(`
      *,
      events (
        id, name, date, time, venue, order_index
      )
    `);

  const { data, error } = await (isUuid
    ? query.eq("id", cleanId)
    : query.eq("slug", cleanId)
  ).single();

  if (error || !data) {
    return null;
  }

  // Cache entry under both ID and slug for instant cross-lookups
  const expiresAt = Date.now() + CACHE_TTL_MS;
  const entry: CacheEntry<any> = { data, expiresAt };

  if (data.id) {
    invitationCache.set(data.id.toLowerCase().trim(), entry);
  }
  if (data.slug) {
    invitationCache.set(data.slug.toLowerCase().trim(), entry);
  }

  return data;
}

/**
 * Fetch guest link credentials with sub-millisecond memory caching.
 */
export async function getCachedGuestLink(invitationId: string, guestSlug: string) {
  const cacheKey = `${invitationId.toLowerCase().trim()}:${guestSlug.toLowerCase().trim()}`;
  const cached = guestLinkCache.get(cacheKey);

  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }

  const supabase = createServiceClient();
  const { data: guestLinks } = await supabase
    .from("guest_links")
    .select("guest_name, allowed_events, seats")
    .eq("invitation_id", invitationId)
    .eq("guest_slug", guestSlug)
    .limit(1);

  const guestLink = guestLinks?.[0] ?? null;

  guestLinkCache.set(cacheKey, {
    data: guestLink,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return guestLink;
}

/**
 * Explicitly invalidate an invitation from cache when edited or published.
 */
export function invalidateInvitationCache(idOrSlug: string) {
  const key = idOrSlug.toLowerCase().trim();
  invitationCache.delete(key);

  // Clear any guest links associated with this invitation
  for (const [k] of guestLinkCache) {
    if (k.startsWith(`${key}:`)) {
      guestLinkCache.delete(k);
    }
  }
}
