/**
 * Gatekeeper Scanner Authorization Utilities
 * Handles PIN derivation, verification, and zero-downtime database fallback.
 */

export function getDeterministicPin(invitationId: string): string {
  if (!invitationId) return '1234';
  let hash = 0;
  for (let i = 0; i < invitationId.length; i++) {
    hash = ((hash << 5) - hash) + invitationId.charCodeAt(i);
    hash |= 0;
  }
  const numeric = Math.abs(hash) % 9000 + 1000;
  return String(numeric);
}

export function resolveInvitationPin(inv: { id: string; scanner_pin?: string | null }): string {
  if (inv.scanner_pin && inv.scanner_pin.trim().length >= 4) {
    return inv.scanner_pin.trim();
  }
  return getDeterministicPin(inv.id);
}

export function verifyScannerAccess(
  inv: { id: string; user_id: string; scanner_pin?: string | null; scanner_active?: boolean | null },
  userId?: string | null,
  providedPin?: string | null
): { authorized: boolean; isOwner: boolean; error?: string } {
  // 1. Check if Gatekeeper Scanner is active
  if (inv.scanner_active === false) {
    // If owner session in dashboard camera mode without a PIN, allow host to view
    if (userId && inv.user_id === userId && !providedPin) {
      return { authorized: true, isOwner: true };
    }
    return {
      authorized: false,
      isOwner: false,
      error: 'Gatekeeper scanner access has been disabled by the event host.'
    };
  }

  const expectedPin = resolveInvitationPin(inv);
  const cleanProvided = providedPin ? String(providedPin).trim() : null;

  // 2. If a PIN was provided (e.g. on the Gatekeeper PIN challenge screen), IT MUST MATCH the expected PIN!
  // We do NOT bypass PIN check even if the logged-in user is the owner testing the gatekeeper URL.
  if (cleanProvided) {
    if (cleanProvided === expectedPin) {
      return { authorized: true, isOwner: !!(userId && inv.user_id === userId) };
    }
    return {
      authorized: false,
      isOwner: false,
      error: 'Incorrect Gatekeeper PIN. Please verify with the event host.'
    };
  }

  // 3. If NO PIN was provided, allow access ONLY for authenticated host session (e.g. Host Scanner tab in dashboard)
  if (userId && inv.user_id === userId) {
    return { authorized: true, isOwner: true };
  }

  return {
    authorized: false,
    isOwner: false,
    error: 'Gatekeeper PIN required.'
  };
}
