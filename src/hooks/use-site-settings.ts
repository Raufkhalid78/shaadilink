'use client';

import { useState, useEffect } from 'react';
import { OFFICIAL_BANK_DETAILS, type BankAccountDetails } from '@/lib/bank-details';
import { CONTACT_CONFIG } from '@/lib/config';

let cachedSettings: BankAccountDetails | null = null;

export function useSiteSettings() {
  const [settings, setSettings] = useState<BankAccountDetails>(
    cachedSettings || OFFICIAL_BANK_DETAILS
  );

  useEffect(() => {
    fetch('/api/settings/bank-details')
      .then((res) => res.json())
      .then((data) => {
        if (data && (data.whatsappSupport || data.bankDetails?.whatsappSupport || data.bankName)) {
          const d = data.bankDetails || data;
          const merged: BankAccountDetails = {
            ...OFFICIAL_BANK_DETAILS,
            ...d,
            whatsappSupport: d.whatsappSupport || d.whatsapp_support || OFFICIAL_BANK_DETAILS.whatsappSupport,
            contactPhone: d.contactPhone || d.contact_phone || OFFICIAL_BANK_DETAILS.contactPhone,
            contactEmail: d.contactEmail || d.contact_email || OFFICIAL_BANK_DETAILS.contactEmail,
            officeAddress: d.officeAddress || d.office_address || OFFICIAL_BANK_DETAILS.officeAddress,
            siteName: d.siteName || d.site_name || OFFICIAL_BANK_DETAILS.siteName,
          };
          cachedSettings = merged;
          setSettings(merged);
        }
      })
      .catch(() => {});
  }, []);

  const rawWhatsapp = (
    settings.whatsappSupport ||
    settings.contactPhone ||
    CONTACT_CONFIG.rawPhoneNumber ||
    '447517879333'
  ).replace(/[^0-9]/g, '');

  const whatsappUrl = `https://wa.me/${rawWhatsapp}`;
  const displayPhone = settings.contactPhone || settings.whatsappSupport || CONTACT_CONFIG.phone;

  return {
    settings,
    rawWhatsapp,
    whatsappUrl,
    displayPhone,
    email: settings.contactEmail || CONTACT_CONFIG.email,
    address: settings.officeAddress || CONTACT_CONFIG.address,
  };
}
