import { createClient, createServiceClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'

export class AuthError extends Error {
  status: number
  constructor(message: string, status = 401) {
    super(message)
    this.name = 'AuthError'
    this.status = status
  }
}

/**
 * Ensures the request is from an authenticated user.
 * Throws AuthError(401) if not logged in.
 */
export async function requireUser(): Promise<User> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new AuthError('Unauthorized. Please log in.', 401)
  }

  return user
}

/**
 * Ensures the request is from an authorized Administrator.
 * Checks against ADMIN_EMAIL env list and profiles.role.
 * Throws AuthError(401) or AuthError(403) if unauthorized.
 */
export async function requireAdmin(): Promise<User> {
  const user = await requireUser()

  const adminEmails = (process.env.ADMIN_EMAIL || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)

  const isEmailAdmin = user.email && adminEmails.includes(user.email.toLowerCase())

  if (isEmailAdmin) {
    return user
  }

  // Fallback: Check profile role
  try {
    const service = createServiceClient()
    const { data: profile } = await service
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single()

    if (profile?.plan === 'admin') {
      return user
    }
  } catch (err) {
    console.error('Admin verification lookup error:', err)
  }

  throw new AuthError('Forbidden. Administrator access required.', 403)
}

/**
 * Ensures the authenticated user is the owner of the requested invitation.
 * Throws AuthError(404) if not found, or AuthError(403) if owned by another user.
 */
export async function requireInvitationOwner(invitationId: string): Promise<{ user: User; invitation: any }> {
  const user = await requireUser()
  const service = createServiceClient()

  const { data: invitation, error } = await service
    .from('invitations')
    .select('*')
    .eq('id', invitationId)
    .single()

  if (error || !invitation) {
    throw new AuthError('Invitation not found', 404)
  }

  if (invitation.user_id !== user.id) {
    throw new AuthError('Forbidden. You do not have permission to manage this invitation.', 403)
  }

  return { user, invitation }
}
