import { redirect, notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ScanQueryPage({
  searchParams,
}: {
  searchParams: Promise<{ invitationId?: string; id?: string; slug?: string; pin?: string; gate?: string }>;
}) {
  const { invitationId, id, slug, pin, gate } = await searchParams;
  const targetId = invitationId || id || slug;

  if (!targetId) {
    notFound();
  }

  const query = new URLSearchParams();
  if (pin) query.set('pin', pin);
  if (gate) query.set('gate', gate);

  const queryString = query.toString() ? `?${query.toString()}` : '';
  redirect(`/scan/${targetId}${queryString}`);
}
