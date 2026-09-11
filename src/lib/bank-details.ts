/**
 * Official Bank Transfer & Raast Configuration
 * Centralized banking details for manual Pakistani payment methods across all event types.
 * Pure client-safe data and types (No Node.js fs/path, no server database dependencies).
 */
export interface BankAccountDetails {
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban: string;
  branchCode?: string;
  raastId: string;
  easyPaisaAccount?: string;
  jazzCashAccount?: string;
  whatsappSupport: string;
  instructionsUrdu: string;
  instructionsEnglish: string;
  siteName?: string;
  contactEmail?: string;
  contactPhone?: string;
  officeAddress?: string;
  classicPrice?: number;
  royalPrice?: number;
}

export const OFFICIAL_BANK_DETAILS: BankAccountDetails = {
  bankName: process.env.NEXT_PUBLIC_BANK_NAME || 'Meezan Bank Ltd',
  accountTitle: process.env.NEXT_PUBLIC_BANK_ACCOUNT_TITLE || 'Smart Invites Pvt Ltd',
  accountNumber: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER || '02010108923412',
  iban: process.env.NEXT_PUBLIC_BANK_IBAN || 'PK45MEZN0002010108923412',
  branchCode: '',
  raastId: process.env.NEXT_PUBLIC_RAAST_ID || '',
  easyPaisaAccount: process.env.NEXT_PUBLIC_EASYPAISA_ACCOUNT || '',
  jazzCashAccount: process.env.NEXT_PUBLIC_JAZZCASH_ACCOUNT || '',
  whatsappSupport: process.env.NEXT_PUBLIC_WHATSAPP_SUPPORT || '923001234567',
  instructionsEnglish:
    'Transfer the exact order amount via your mobile banking app (IBFT) or Raast ID. Upload the payment receipt/screenshot and enter your transaction reference below.',
  instructionsUrdu:
    'براہ کرم اوپر دیے گئے بینک اکاؤنٹ یا راست آئی ڈی پر رقم منتقل کریں اور نیچے رسید/اسکرین شاٹ اپ لوڈ کریں۔',
  siteName: 'Smart Invites',
  contactEmail: 'support@smartinvites.com.pk',
  contactPhone: '+92 300 1234567',
  officeAddress: 'Lahore & Karachi, Pakistan',
  classicPrice: 3499,
  royalPrice: 5799,
};
