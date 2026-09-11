import { createServiceClient } from './supabase/service';

const SAFE_ALPHABET = '23456789abcdefghjkmnpqrstuvwxyz';
const TOKEN_LENGTH = 8; // Exactly 8 characters (within 7-9 character range requested)
export const DEFAULT_MAX_REVIEW_VIEWS = 7;

/**
 * Generates an unguessable, human-friendly 8-character review token.
 * Uses unambiguous characters (no 0/O, 1/l/I) with >1 trillion combinations.
 */
export function generateShortReviewToken(): string {
  let token = '';
  for (let i = 0; i < TOKEN_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * SAFE_ALPHABET.length);
    token += SAFE_ALPHABET[randomIndex];
  }
  return token;
}

export interface ReviewTokenInfo {
  token: string;
  viewsCount: number;
  maxViews: number;
  isExpired: boolean;
  source: 'column' | 'metadata_fallback';
}

/**
 * Fallback parser for extracting review metadata from client_approval_notes
 * in case custom columns have not yet been synced in Supabase schema cache.
 */
function parseNotesMetadata(notes?: string | null): { token?: string; views?: number; max?: number } | null {
  if (!notes || !notes.includes('[REVIEW_META:')) return null;
  const match = notes.match(/\[REVIEW_META:token=([a-z0-9_-]+):views=(\d+):max=(\d+)\]/i);
  if (!match) return null;
  return {
    token: match[1],
    views: parseInt(match[2], 10) || 0,
    max: parseInt(match[3], 10) || DEFAULT_MAX_REVIEW_VIEWS,
  };
}

function formatNotesMetadata(token: string, views: number, max: number, originalNotes?: string | null): string {
  const cleanOriginal = (originalNotes || '').replace(/\[REVIEW_META:[^\]]+\]/g, '').trim();
  const metaTag = `[REVIEW_META:token=${token}:views=${views}:max=${max}]`;
  return cleanOriginal ? `${cleanOriginal}\n\n${metaTag}` : metaTag;
}

/**
 * Retrieves the active review token and stats, or creates one if it does not exist yet.
 */
export async function getOrCreateReviewToken(invitationId: string): Promise<ReviewTokenInfo> {
  const service = createServiceClient();

  // 1. Try querying dedicated columns first
  const { data: invWithCols, error: colError } = await service
    .from('invitations')
    .select('id, review_token, review_views_count, review_max_views, client_approval_notes')
    .eq('id', invitationId)
    .single();

  if (!colError && invWithCols) {
    let currentToken = invWithCols.review_token;
    let viewsCount = invWithCols.review_views_count ?? 0;
    let maxViews = invWithCols.review_max_views ?? DEFAULT_MAX_REVIEW_VIEWS;

    if (!currentToken) {
      currentToken = generateShortReviewToken();
      viewsCount = 0;
      await service
        .from('invitations')
        .update({
          review_token: currentToken,
          review_views_count: 0,
          review_max_views: maxViews,
        })
        .eq('id', invitationId);
    }

    return {
      token: currentToken,
      viewsCount,
      maxViews,
      isExpired: viewsCount >= maxViews,
      source: 'column',
    };
  }

  // 2. Resilient fallback via client_approval_notes
  const { data: invFallback } = await service
    .from('invitations')
    .select('id, client_approval_notes')
    .eq('id', invitationId)
    .single();

  const parsed = parseNotesMetadata(invFallback?.client_approval_notes);
  if (parsed?.token) {
    return {
      token: parsed.token,
      viewsCount: parsed.views || 0,
      maxViews: parsed.max || DEFAULT_MAX_REVIEW_VIEWS,
      isExpired: (parsed.views || 0) >= (parsed.max || DEFAULT_MAX_REVIEW_VIEWS),
      source: 'metadata_fallback',
    };
  }

  // Generate new token in fallback
  const newToken = generateShortReviewToken();
  const updatedNotes = formatNotesMetadata(newToken, 0, DEFAULT_MAX_REVIEW_VIEWS, invFallback?.client_approval_notes);

  await service
    .from('invitations')
    .update({ client_approval_notes: updatedNotes })
    .eq('id', invitationId);

  return {
    token: newToken,
    viewsCount: 0,
    maxViews: DEFAULT_MAX_REVIEW_VIEWS,
    isExpired: false,
    source: 'metadata_fallback',
  };
}

/**
 * Validates a submitted token and increments the view counter (unless it's the same 30-min browser session).
 */
export async function verifyAndConsumeReviewView(
  invitationId: string,
  submittedToken: string,
  isSameSession: boolean
): Promise<{ valid: boolean; isExpired: boolean; viewsCount: number; maxViews: number }> {
  const tokenInfo = await getOrCreateReviewToken(invitationId);

  // Check if token matches (case-insensitive)
  if (!tokenInfo.token || tokenInfo.token.toLowerCase() !== submittedToken.trim().toLowerCase()) {
    return {
      valid: false,
      isExpired: false,
      viewsCount: tokenInfo.viewsCount,
      maxViews: tokenInfo.maxViews,
    };
  }

  // Check if already expired before this view
  if (tokenInfo.viewsCount >= tokenInfo.maxViews) {
    return {
      valid: true,
      isExpired: true,
      viewsCount: tokenInfo.viewsCount,
      maxViews: tokenInfo.maxViews,
    };
  }

  // If user refreshed or navigated back within the same session, don't double count
  if (isSameSession) {
    return {
      valid: true,
      isExpired: false,
      viewsCount: tokenInfo.viewsCount,
      maxViews: tokenInfo.maxViews,
    };
  }

  // New distinct session: Increment view count by 1
  const newCount = tokenInfo.viewsCount + 1;
  const service = createServiceClient();

  if (tokenInfo.source === 'column') {
    await service
      .from('invitations')
      .update({ review_views_count: newCount })
      .eq('id', invitationId);
  } else {
    const { data: inv } = await service
      .from('invitations')
      .select('client_approval_notes')
      .eq('id', invitationId)
      .single();

    const updatedNotes = formatNotesMetadata(
      tokenInfo.token,
      newCount,
      tokenInfo.maxViews,
      inv?.client_approval_notes
    );
    await service
      .from('invitations')
      .update({ client_approval_notes: updatedNotes })
      .eq('id', invitationId);
  }

  return {
    valid: true,
    isExpired: false,
    viewsCount: newCount,
    maxViews: tokenInfo.maxViews,
  };
}

/**
 * Regenerates a brand-new token and resets views to 0/7 (revoking the old link).
 */
export async function resetReviewToken(invitationId: string): Promise<ReviewTokenInfo> {
  const service = createServiceClient();
  const newToken = generateShortReviewToken();

  const { error } = await service
    .from('invitations')
    .update({
      review_token: newToken,
      review_views_count: 0,
      review_max_views: DEFAULT_MAX_REVIEW_VIEWS,
    })
    .eq('id', invitationId);

  if (error) {
    // Fallback if column not yet in DB
    const { data: inv } = await service
      .from('invitations')
      .select('client_approval_notes')
      .eq('id', invitationId)
      .single();

    const updatedNotes = formatNotesMetadata(
      newToken,
      0,
      DEFAULT_MAX_REVIEW_VIEWS,
      inv?.client_approval_notes
    );
    await service
      .from('invitations')
      .update({ client_approval_notes: updatedNotes })
      .eq('id', invitationId);

    return {
      token: newToken,
      viewsCount: 0,
      maxViews: DEFAULT_MAX_REVIEW_VIEWS,
      isExpired: false,
      source: 'metadata_fallback',
    };
  }

  return {
    token: newToken,
    viewsCount: 0,
    maxViews: DEFAULT_MAX_REVIEW_VIEWS,
    isExpired: false,
    source: 'column',
  };
}
