export interface WholesaleCreditPack {
  id: string;
  name: string;
  credits: number;
  pricePKR: number;
  pricePerInvite: number;
  savingsPercent: number;
  popular?: boolean;
  features: string[];
}

export const WHOLESALE_CREDIT_PACKS: WholesaleCreditPack[] = [
  {
    id: 'starter_5',
    name: 'Starter Pack',
    credits: 5,
    pricePKR: 11000,
    pricePerInvite: 2200,
    savingsPercent: 37,
    features: [
      '5 Complete Event Activations',
      '100% White-Label Footer Branding',
      'Client Review Links (8-char / 7-view limit)',
      'Digital Guest Pass & QR Scanner',
    ],
  },
  {
    id: 'growth_10',
    name: 'Growth Pack',
    credits: 10,
    pricePKR: 19000,
    pricePerInvite: 1900,
    savingsPercent: 45,
    popular: true,
    features: [
      '10 Complete Event Activations',
      '100% White-Label Footer Branding',
      'Custom Agency Logo & Accent Color',
      'Client PDF Invoicing Generator',
      'Priority VIP Agency Support',
    ],
  },
  {
    id: 'enterprise_25',
    name: 'Enterprise Pack',
    credits: 25,
    pricePKR: 40000,
    pricePerInvite: 1600,
    savingsPercent: 54,
    features: [
      '25 Complete Event Activations',
      'Maximum Wholesale Margin (Save 54%)',
      'Unlimited Client Review Tokens',
      'Dedicated Account Manager via WhatsApp',
      'Custom Domain Support on Request',
    ],
  },
];

export interface AgencyPortalData {
  application: {
    id: string;
    company_name: string;
    contact_name: string;
    email: string;
    phone: string;
    city?: string;
    website_or_social?: string;
    monthly_events?: string;
    status: 'pending' | 'approved' | 'rejected';
    credits_balance: number;
    white_label_enabled: boolean;
    agency_logo_url?: string;
    tagline?: string;
    instagram_handle?: string;
    website_url?: string;
    accent_color?: string;
    payout_details?: string;
    deletion_requested?: boolean;
    deletion_requested_at?: string;
    deletion_reason?: string;
    created_at: string;
  };
  creditOrders: AgencyCreditOrder[];
  invitations: AgencyInvitationSummary[];
}

export interface AgencyCreditOrder {
  id: string;
  user_id?: string;
  agency_id: string;
  agency_name: string;
  pack_name: string;
  credits_count: number;
  amount_pkr: number;
  payment_method: 'manual_bank' | 'safepay';
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  receipt_url?: string;
  transaction_reference?: string;
  safepay_tracker?: string;
  admin_notes?: string;
  created_at: string;
}

export interface AgencyInvitationSummary {
  id: string;
  title?: string;
  partner1_name: string;
  partner2_name: string;
  plan: string;
  is_active: boolean;
  slug?: string;
  template_id?: string;
  event_type?: string;
  client_approval_status?: string;
  client_approval_notes?: string;
  review_token?: string;
  review_views_count?: number;
  created_at: string;
}
