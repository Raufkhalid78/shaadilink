'use server';

import { requireAdmin } from '@/lib/auth-helpers';
import { createServiceClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { writeLocalSettings } from '@/lib/bank-details-server';

export async function updateSettings(formData: FormData) {
  try {
    await requireAdmin();
  } catch (err: any) {
    return { error: err.message || 'Unauthorized' };
  }

  const admin_email = ((formData.get('admin_email') as string) || '').trim();
  const maintenance_mode = formData.get('maintenance_mode') === 'true';

  // Bank Transfer Details
  const bank_name = ((formData.get('bank_name') as string) || '').trim();
  const account_title = ((formData.get('account_title') as string) || '').trim();
  const account_number = ((formData.get('account_number') as string) || '').trim();
  const iban = ((formData.get('iban') as string) || '').trim();
  const branch_code = ((formData.get('branch_code') as string) || '').trim();
  const raast_id = ((formData.get('raast_id') as string) || '').trim();
  const easypaisa_account = ((formData.get('easypaisa_account') as string) || '').trim();
  const jazzcash_account = ((formData.get('jazzcash_account') as string) || '').trim();
  const whatsapp_support = ((formData.get('whatsapp_support') as string) || '').trim();
  const instructions_english = ((formData.get('instructions_english') as string) || '').trim();
  const instructions_urdu = ((formData.get('instructions_urdu') as string) || '').trim();

  // Brand & Contact
  const site_name = ((formData.get('site_name') as string) || 'Smart Invites').trim();
  const contact_email = ((formData.get('contact_email') as string) || '').trim();
  const contact_phone = ((formData.get('contact_phone') as string) || '').trim();
  const office_address = ((formData.get('office_address') as string) || '').trim();

  // Pricing (Platform has two plans: Classic and Royal)
  const classic_price = Number(formData.get('classic_price')) || 3499;
  const royal_price = Number(formData.get('royal_price')) || 5799;

  // Always write to local resilient storage so settings take effect immediately
  writeLocalSettings({
    bankName: bank_name,
    accountTitle: account_title,
    accountNumber: account_number,
    iban: iban,
    branchCode: branch_code,
    raastId: raast_id,
    easyPaisaAccount: easypaisa_account,
    jazzCashAccount: jazzcash_account,
    whatsappSupport: whatsapp_support,
    instructionsEnglish: instructions_english,
    instructionsUrdu: instructions_urdu,
    siteName: site_name,
    contactEmail: contact_email,
    contactPhone: contact_phone,
    officeAddress: office_address,
    classicPrice: classic_price,
    royalPrice: royal_price,
  });

  const supabase = createServiceClient();
  const { data: existing } = await supabase.from('site_settings').select('id').limit(1).single();

  const fullUpdatePayload = {
    admin_email: admin_email || undefined,
    maintenance_mode,
    bank_name,
    account_title,
    account_number,
    iban,
    branch_code,
    raast_id,
    easypaisa_account,
    jazzcash_account,
    whatsapp_support,
    instructions_english,
    instructions_urdu,
    site_name,
    contact_email,
    contact_phone,
    office_address,
    classic_price,
    royal_price,
    updated_at: new Date().toISOString(),
  };

  let dbError;

  if (existing?.id) {
    const { error: updateError } = await supabase
      .from('site_settings')
      .update(fullUpdatePayload)
      .eq('id', existing.id);

    if (updateError && updateError.code === '42703') {
      // Fallback if table columns haven't been altered yet
      const basePayload = {
        admin_email: admin_email || undefined,
        maintenance_mode,
        updated_at: new Date().toISOString(),
      };
      const { error: baseErr } = await supabase
        .from('site_settings')
        .update(basePayload)
        .eq('id', existing.id);
      dbError = baseErr;
    } else {
      dbError = updateError;
    }
  } else {
    const { error: insertError } = await supabase
      .from('site_settings')
      .insert({ admin_email, maintenance_mode });
    dbError = insertError;
  }

  if (dbError) {
    console.warn('Database site_settings update warning:', dbError.message);
  }

  revalidatePath('/admin/settings');
  revalidatePath('/admin');
  revalidatePath('/payment');
  revalidatePath('/');

  return { success: true };
}
