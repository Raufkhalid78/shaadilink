-- Migration: Add Bank Details, Brand Info, and Pricing to site_settings table
-- Enables all-event platform administration and dynamic bank transfer management

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS bank_name TEXT DEFAULT 'Meezan Bank Ltd',
  ADD COLUMN IF NOT EXISTS account_title TEXT DEFAULT 'Smart Invites Pvt Ltd',
  ADD COLUMN IF NOT EXISTS account_number TEXT DEFAULT '02010108923412',
  ADD COLUMN IF NOT EXISTS iban TEXT DEFAULT 'PK45MEZN0002010108923412',
  ADD COLUMN IF NOT EXISTS branch_code TEXT DEFAULT '0201',
  ADD COLUMN IF NOT EXISTS raast_id TEXT DEFAULT '03001234567',
  ADD COLUMN IF NOT EXISTS easypaisa_account TEXT DEFAULT '03001234567',
  ADD COLUMN IF NOT EXISTS jazzcash_account TEXT DEFAULT '03001234567',
  ADD COLUMN IF NOT EXISTS whatsapp_support TEXT DEFAULT '923001234567',
  ADD COLUMN IF NOT EXISTS instructions_english TEXT DEFAULT 'Transfer the exact order amount via your mobile banking app (IBFT) or Raast ID. Upload the payment receipt/screenshot and enter your transaction reference below.',
  ADD COLUMN IF NOT EXISTS instructions_urdu TEXT DEFAULT 'براہ کرم اوپر دیے گئے بینک اکاؤنٹ یا راست آئی ڈی پر رقم منتقل کریں اور نیچے رسید/اسکرین شاٹ اپ لوڈ کریں۔',
  ADD COLUMN IF NOT EXISTS site_name TEXT DEFAULT 'Smart Invites',
  ADD COLUMN IF NOT EXISTS contact_email TEXT DEFAULT 'support@smartinvites.com.pk',
  ADD COLUMN IF NOT EXISTS contact_phone TEXT DEFAULT '+92 300 1234567',
  ADD COLUMN IF NOT EXISTS office_address TEXT DEFAULT 'Lahore & Karachi, Pakistan',
  ADD COLUMN IF NOT EXISTS classic_price NUMERIC DEFAULT 3499,
  ADD COLUMN IF NOT EXISTS royal_price NUMERIC DEFAULT 5799;
