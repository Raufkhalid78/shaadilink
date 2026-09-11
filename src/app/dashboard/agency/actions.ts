'use server';

import { createClient, createServiceClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { WHOLESALE_CREDIT_PACKS, AgencyPortalData, AgencyCreditOrder, AgencyInvitationSummary } from '@/lib/agency';

export async function getAgencyPortalData(): Promise<
  | { success: true; data: AgencyPortalData }
  | { error: string; application?: any }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const service = createServiceClient();

  // Check if they have an agency application (by user_id OR email)
  const { data: app } = await service
    .from('agency_applications')
    .select('*')
    .or(`user_id.eq.${user.id},email.eq.${user.email}`)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!app) {
    return { error: 'No application found' };
  }

  if (app.status !== 'approved') {
    return { error: 'Not approved', application: app };
  }

  // Link user_id if null
  if (!app.user_id) {
    await service
      .from('agency_applications')
      .update({ user_id: user.id })
      .eq('id', app.id);
  }

  // Fetch credit purchase history
  const { data: creditOrders } = await service
    .from('agency_credit_orders')
    .select('*')
    .eq('agency_id', app.id)
    .order('created_at', { ascending: false });

  // Fetch client invitations
  const { data: rawInvitations } = await service
    .from('invitations')
    .select(`
      id,
      slug,
      template_id,
      partner1_name,
      partner2_name,
      title,
      plan,
      is_active,
      created_at,
      client_approval_status,
      review_token,
      review_views_count
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const invitations: AgencyInvitationSummary[] = (rawInvitations || []).map((inv: any) => ({
    id: inv.id,
    slug: inv.slug,
    template_id: inv.template_id,
    partner1_name: inv.partner1_name,
    partner2_name: inv.partner2_name,
    title: inv.title,
    plan: inv.plan || 'agency',
    is_active: inv.is_active,
    created_at: inv.created_at,
    client_approval_status: inv.client_approval_status,
    review_token: inv.review_token,
    review_views_count: inv.review_views_count,
  }));

  return {
    success: true,
    data: {
      application: app,
      creditOrders: creditOrders || [],
      invitations,
    },
  };
}

export async function submitAgencyCreditOrder(data: {
  packId: string;
  paymentMethod: 'manual_bank' | 'safepay';
  transactionReference?: string;
  receiptUrl?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const pack = WHOLESALE_CREDIT_PACKS.find((p) => p.id === data.packId);
  if (!pack) return { error: 'Invalid credit pack selected' };

  if (data.paymentMethod === 'manual_bank') {
    if (!data.transactionReference?.trim()) {
      return { error: 'Transaction Reference / TID is required' };
    }
  }

  const service = createServiceClient();

  // Find agency application
  const { data: app } = await service
    .from('agency_applications')
    .select('id, company_name')
    .or(`user_id.eq.${user.id},email.eq.${user.email}`)
    .eq('status', 'approved')
    .single();

  if (!app) {
    return { error: 'Approved agency account not found' };
  }

  const { data: newOrder, error } = await service
    .from('agency_credit_orders')
    .insert({
      user_id: user.id,
      agency_id: app.id,
      agency_name: app.company_name,
      pack_name: pack.name,
      credits_count: pack.credits,
      amount_pkr: pack.pricePKR,
      payment_method: data.paymentMethod,
      status: 'pending',
      receipt_url: data.receiptUrl || null,
      transaction_reference: data.transactionReference?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard/agency');
  revalidatePath('/admin/agency');
  return { success: true, order: newOrder };
}

/**
 * Fulfills an agency credit order, sets status to 'completed',
 * and atomically increments the agency's credit balance.
 */
export async function fulfillAgencyCreditOrder(orderIdentifier: string) {
  const service = createServiceClient();

  // Find order by ID or safepay_tracker
  let query = service.from('agency_credit_orders').select('*');
  if (orderIdentifier.includes('-') && orderIdentifier.length === 36) {
    query = query.or(`id.eq.${orderIdentifier},safepay_tracker.eq.${orderIdentifier}`);
  } else {
    query = query.eq('safepay_tracker', orderIdentifier);
  }

  const { data: order, error } = await query.maybeSingle();
  if (error || !order) {
    console.error('Agency credit order not found for fulfillment:', orderIdentifier, error);
    return { error: 'Order not found' };
  }

  if (order.status === 'completed' || order.status === 'approved') {
    return { success: true, alreadyFulfilled: true, order };
  }

  // 1. Mark order as completed
  const { error: updateOrderErr } = await service
    .from('agency_credit_orders')
    .update({
      status: 'completed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', order.id);

  if (updateOrderErr) {
    console.error('Failed to update agency credit order status:', updateOrderErr);
    return { error: 'Failed to update order status' };
  }

  // 2. Fetch current balance of agency application
  const { data: app } = await service
    .from('agency_applications')
    .select('id, credits_balance')
    .eq('id', order.agency_id)
    .single();

  if (app) {
    const currentBal = Number(app.credits_balance ?? 0);
    const newBal = currentBal + Number(order.credits_count);

    await service
      .from('agency_applications')
      .update({
        credits_balance: newBal,
        updated_at: new Date().toISOString(),
      })
      .eq('id', app.id);
  }

  revalidatePath('/dashboard/agency');
  revalidatePath('/admin/agency');
  return { success: true, order };
}

export async function updateAgencyBranding(data: {
  whiteLabelEnabled: boolean;
  agencyLogoUrl?: string;
  tagline?: string;
  instagramHandle?: string;
  websiteUrl?: string;
  accentColor?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const service = createServiceClient();

  const { error } = await service
    .from('agency_applications')
    .update({
      white_label_enabled: data.whiteLabelEnabled,
      agency_logo_url: data.agencyLogoUrl || null,
      tagline: data.tagline?.trim() || null,
      instagram_handle: data.instagramHandle?.trim() || null,
      website_url: data.websiteUrl?.trim() || null,
      accent_color: data.accentColor?.trim() || '#C9A84C',
      updated_at: new Date().toISOString(),
    })
    .or(`user_id.eq.${user.id},email.eq.${user.email}`);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard/agency');
  return { success: true };
}

export async function updateAgencyProfile(data: {
  companyName: string;
  contactName: string;
  phone: string;
  city?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  if (!data.companyName?.trim() || !data.contactName?.trim() || !data.phone?.trim()) {
    return { error: 'Company Name, Contact Person, and Phone are required' };
  }

  const service = createServiceClient();
  const { error } = await service
    .from('agency_applications')
    .update({
      company_name: data.companyName.trim(),
      contact_name: data.contactName.trim(),
      phone: data.phone.trim(),
      city: data.city?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .or(`user_id.eq.${user.id},email.eq.${user.email}`);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard/agency');
  return { success: true };
}

export async function activateInvitationWithAgencyCredit(invitationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const service = createServiceClient();

  // Get agency application
  const { data: app } = await service
    .from('agency_applications')
    .select('id, credits_balance')
    .or(`user_id.eq.${user.id},email.eq.${user.email}`)
    .eq('status', 'approved')
    .single();

  if (!app) {
    return { error: 'Approved agency account required' };
  }

  const currentBalance = Number(app.credits_balance ?? 0);
  if (currentBalance < 1) {
    return { error: 'Insufficient credits. Please top up your wholesale balance.' };
  }

  // Verify invitation ownership
  const { data: inv } = await service
    .from('invitations')
    .select('id, user_id, is_active')
    .eq('id', invitationId)
    .eq('user_id', user.id)
    .single();

  if (!inv) {
    return { error: 'Invitation not found or unauthorized' };
  }

  // Deduct 1 credit
  const newBalance = currentBalance - 1;
  const { error: balanceError } = await service
    .from('agency_applications')
    .update({ credits_balance: newBalance })
    .eq('id', app.id);

  if (balanceError) {
    return { error: 'Failed to update credit balance' };
  }

  // Activate invitation
  const { error: invError } = await service
    .from('invitations')
    .update({
      is_active: true,
      client_approval_status: 'approved',
      client_approved_at: new Date().toISOString(),
    })
    .eq('id', invitationId);

  if (invError) {
    // Rollback credit if failed
    await service
      .from('agency_applications')
      .update({ credits_balance: currentBalance })
      .eq('id', app.id);
    return { error: 'Failed to activate invitation' };
  }

  revalidatePath('/dashboard/agency');
  revalidatePath('/dashboard');
  return { success: true, remainingCredits: newBalance };
}

/**
 * Option 3: Smart Hybrid - Instant Deletion if 0 active live weddings.
 */
export async function instantDeleteAgencyAccount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const service = createServiceClient();

  // 1. Verify that agency has 0 active live invitations
  const { data: activeInvs } = await service
    .from('invitations')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_active', true);

  if (activeInvs && activeInvs.length > 0) {
    return {
      error: `You currently have ${activeInvs.length} active live client weddings published. Please submit an Account Deletion Request so client links can be protected.`,
    };
  }

  // 2. Delete any unpaid draft invitations
  await service.from('invitations').delete().eq('user_id', user.id).eq('is_active', false);

  // 3. Delete credit orders
  await service.from('agency_credit_orders').delete().eq('user_id', user.id);

  // 4. Delete agency application
  await service.from('agency_applications').delete().eq('user_id', user.id);

  // 5. Delete Supabase auth user completely
  const { error: authErr } = await service.auth.admin.deleteUser(user.id);
  if (authErr) {
    console.error('Failed to delete auth user:', authErr);
  }

  // 6. Sign out
  await supabase.auth.signOut();

  return { success: true };
}

/**
 * Option 3: Smart Hybrid - Request Deletion if active live weddings exist.
 * Sets 3-month (90-day) auto_delete_at retention on active client invitations so guests never experience a broken link!
 */
export async function requestAgencyAccountDeletion(reason: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const service = createServiceClient();

  // 1. Update agency application with deletion request
  const { error: appErr } = await service
    .from('agency_applications')
    .update({
      deletion_requested: true,
      deletion_requested_at: new Date().toISOString(),
      deletion_reason: reason?.trim() || 'Agency closure / account deletion requested',
      updated_at: new Date().toISOString(),
    })
    .or(`user_id.eq.${user.id},email.eq.${user.email}`);

  if (appErr) {
    return { error: appErr.message };
  }

  // 2. Apply 3-month (90-day) retention deadline to all active client invitations
  const ninetyDaysFromNow = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
  await service
    .from('invitations')
    .update({ auto_delete_at: ninetyDaysFromNow })
    .eq('user_id', user.id)
    .eq('is_active', true);

  revalidatePath('/dashboard/agency');
  revalidatePath('/admin/agency');
  return { success: true, retentionDate: ninetyDaysFromNow };
}
