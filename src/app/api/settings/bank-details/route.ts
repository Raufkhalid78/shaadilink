import { NextResponse } from 'next/server';
import { getDynamicBankDetails } from '@/lib/bank-details-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const details = await getDynamicBankDetails();
    return NextResponse.json({ success: true, bankDetails: details, ...details });
  } catch (err) {
    console.error('GET /api/settings/bank-details error:', err);
    return NextResponse.json({ error: 'Failed to retrieve bank details' }, { status: 500 });
  }
}
