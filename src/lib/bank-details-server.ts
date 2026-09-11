import fs from 'fs';
import path from 'path';
import { createServiceClient } from '@/lib/supabase/service';
import { OFFICIAL_BANK_DETAILS, type BankAccountDetails } from './bank-details';

export { OFFICIAL_BANK_DETAILS, type BankAccountDetails };

const FALLBACK_FILE_PATH = path.join(process.cwd(), 'data', 'site-settings.json');

export function readLocalSettings(): Partial<BankAccountDetails> | null {
  try {
    if (fs.existsSync(FALLBACK_FILE_PATH)) {
      const content = fs.readFileSync(FALLBACK_FILE_PATH, 'utf8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn('Could not read local settings fallback:', err);
  }
  return null;
}

export function writeLocalSettings(data: Partial<BankAccountDetails>): void {
  try {
    const dir = path.dirname(FALLBACK_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const current = readLocalSettings() || {};
    const merged = { ...current, ...data };
    fs.writeFileSync(FALLBACK_FILE_PATH, JSON.stringify(merged, null, 2), 'utf8');
  } catch (err) {
    console.warn('Could not write local settings fallback:', err);
  }
}

/**
 * Server-side dynamic bank & brand details resolver
 * Reads from Supabase `site_settings`, merges with file fallback and environment defaults.
 */
export async function getDynamicBankDetails(): Promise<BankAccountDetails> {
  try {
    const supabase = createServiceClient();
    const { data: dbRow, error } = await supabase
      .from('site_settings')
      .select('*')
      .limit(1)
      .single();

    const localSettings = readLocalSettings() || {};

    if (dbRow && !error) {
      return {
        bankName: dbRow.bank_name || localSettings.bankName || OFFICIAL_BANK_DETAILS.bankName,
        accountTitle: dbRow.account_title || localSettings.accountTitle || OFFICIAL_BANK_DETAILS.accountTitle,
        accountNumber: dbRow.account_number || localSettings.accountNumber || OFFICIAL_BANK_DETAILS.accountNumber,
        iban: dbRow.iban || localSettings.iban || OFFICIAL_BANK_DETAILS.iban,
        branchCode: (dbRow.branch_code ?? localSettings.branchCode ?? '')?.trim() || '',
        raastId: (dbRow.raast_id ?? localSettings.raastId ?? '')?.trim() || '',
        easyPaisaAccount: (dbRow.easypaisa_account ?? localSettings.easyPaisaAccount ?? '')?.trim() || '',
        jazzCashAccount: (dbRow.jazzcash_account ?? localSettings.jazzCashAccount ?? '')?.trim() || '',
        whatsappSupport: dbRow.whatsapp_support || localSettings.whatsappSupport || OFFICIAL_BANK_DETAILS.whatsappSupport,
        instructionsEnglish: dbRow.instructions_english || localSettings.instructionsEnglish || OFFICIAL_BANK_DETAILS.instructionsEnglish,
        instructionsUrdu: dbRow.instructions_urdu || localSettings.instructionsUrdu || OFFICIAL_BANK_DETAILS.instructionsUrdu,
        siteName: dbRow.site_name || localSettings.siteName || OFFICIAL_BANK_DETAILS.siteName,
        contactEmail: dbRow.contact_email || localSettings.contactEmail || OFFICIAL_BANK_DETAILS.contactEmail,
        contactPhone: dbRow.contact_phone || localSettings.contactPhone || OFFICIAL_BANK_DETAILS.contactPhone,
        officeAddress: dbRow.office_address || localSettings.officeAddress || OFFICIAL_BANK_DETAILS.officeAddress,
        classicPrice: Number(dbRow.classic_price) || localSettings.classicPrice || OFFICIAL_BANK_DETAILS.classicPrice,
        royalPrice: Number(dbRow.royal_price) || localSettings.royalPrice || OFFICIAL_BANK_DETAILS.royalPrice,
      };
    }

    if (Object.keys(localSettings).length > 0) {
      return {
        ...OFFICIAL_BANK_DETAILS,
        ...localSettings,
      };
    }
  } catch (err) {
    console.warn('getDynamicBankDetails error, falling back to defaults:', err);
  }

  return OFFICIAL_BANK_DETAILS;
}
