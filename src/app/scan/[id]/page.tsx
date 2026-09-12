import { notFound } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import { GatekeeperClient } from './gatekeeper-client';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  return {
    title: 'Entrance Pass Scanner | Smart Invites',
    description: 'Gatekeeper QR pass verification portal for guests and attendees.',
    robots: { index: false, follow: false },
  };
}

export default async function GatekeeperScanPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ pin?: string; gate?: string }>;
}) {
  const { id } = await params;
  const { pin: queryPin, gate: queryGate } = await searchParams;

  const service = createServiceClient();
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  const query = service
    .from('invitations')
    .select('id, slug, title, partner1_name, partner2_name, venue, venue_address, category, is_active');

  const { data: inv, error } = isUUID
    ? await query.or(`id.eq.${id},slug.eq.${id}`).maybeSingle()
    : await query.eq('slug', id).maybeSingle();

  if (error || !inv) {
    notFound();
  }

  const displayTitle =
    inv.title ||
    (inv.partner1_name && inv.partner2_name
      ? `${inv.partner1_name} & ${inv.partner2_name}`
      : 'Event');

  return (
    <GatekeeperClient
      invitationId={inv.id}
      eventTitle={displayTitle}
      venue={inv.venue || inv.venue_address || 'Event Venue'}
      category={inv.category || 'wedding'}
      initialPin={queryPin || ''}
      initialGate={queryGate || 'Main Entrance'}
    />
  );
}
