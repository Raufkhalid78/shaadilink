import { createClient } from '@/lib/supabase/server';
import { ExternalLink, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminInvitationsPage() {
  const supabase = await createClient();

  const { data: invitations, error } = await supabase
    .from('invitations')
    .select(`
      id,
      slug,
      partner1_name,
      partner2_name,
      venue,
      is_active,
      created_at,
      template_id
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    return <div>Error loading invitations.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display tracking-tight">Invitations</h1>
        <p className="text-muted-foreground text-sm">View all invitations created on the platform.</p>
      </div>

      <div className="grid gap-4">
        {invitations?.map((inv) => (
          <div key={inv.id} className="p-4 rounded-xl border border-border/50 bg-card/30 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{inv.partner1_name} & {inv.partner2_name}</span>
                {inv.is_active ? (
                  <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Active</span>
                ) : (
                  <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Draft</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Template: {inv.template_id || 'N/A'}</p>
              <p className="text-xs text-muted-foreground/60">Created: {new Date(inv.created_at).toLocaleDateString()}</p>
            </div>

            {inv.is_active && (
              <a 
                href={`/inv/${inv.slug || inv.id}`} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-1 text-sm text-gold hover:text-gold-light transition-colors"
              >
                <ExternalLink className="w-4 h-4" /> View Live
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
