'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Trash2, Building2, Phone, ExternalLink } from 'lucide-react';
import { updateAgencyStatus, deleteAgencyApplication } from '@/app/admin/affiliates/actions';
import { toast } from 'sonner';

export function AgencyManager({ applications }: { applications: any[] }) {
  const [data, setData] = useState(applications);

  async function handleStatusChange(id: string, newStatus: 'approved' | 'rejected') {
    const res = await updateAgencyStatus(id, newStatus);
    if (res.error) {
      toast.error(res.error);
    } else {
      setData(data.map((a) => (a.id === id ? { ...a, status: newStatus } : a)));
      toast.success(`Agency application ${newStatus}`);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this agency application?')) return;

    const res = await deleteAgencyApplication(id);
    if (res.error) {
      toast.error(res.error);
    } else {
      setData(data.filter((a) => a.id !== id));
      toast.success('Application deleted');
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-muted-foreground uppercase bg-muted/20">
          <tr>
            <th className="px-4 py-3 rounded-tl-lg">Agency / Company</th>
            <th className="px-4 py-3">Contact Person</th>
            <th className="px-4 py-3">Contact &amp; WhatsApp</th>
            <th className="px-4 py-3">City &amp; Social</th>
            <th className="px-4 py-3">Monthly Events</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Applied On</th>
            <th className="px-4 py-3 rounded-tr-lg text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {data?.length ? (
            data.map((a: any) => {
              const social = a.website_or_social || '';
              const isUrl = social.startsWith('http://') || social.startsWith('https://');

              return (
                <tr key={a.id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{a.company_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-foreground/80">{a.contact_name}</td>
                  <td className="px-4 py-3 text-xs space-y-0.5">
                    <div>
                      <a href={`mailto:${a.email}`} className="text-emerald-500 hover:underline">
                        {a.email}
                      </a>
                    </div>
                    {a.phone && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Phone className="w-3 h-3 text-emerald-400" />
                        <a
                          href={`https://wa.me/${a.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-emerald-400"
                        >
                          {a.phone}
                        </a>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <p className="text-foreground/80">{a.city || '—'}</p>
                    {social && (
                      <div className="pt-0.5">
                        {isUrl ? (
                          <a
                            href={social}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline text-[11px]"
                          >
                            Portfolio <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">{social}</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-foreground/80">
                    <span className="px-2 py-0.5 rounded-full bg-muted text-[11px] font-medium">
                      {a.monthly_events || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                        a.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : a.status === 'rejected'
                          ? 'bg-red-500/10 text-red-500'
                          : 'bg-amber-500/10 text-amber-500'
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                    {new Date(a.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {a.status !== 'approved' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatusChange(a.id, 'approved')}
                          className="h-7 px-2 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 text-xs"
                          title="Approve Agency"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                        </Button>
                      )}
                      {a.status !== 'rejected' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatusChange(a.id, 'rejected')}
                          className="h-7 px-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 text-xs"
                          title="Reject Agency"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(a.id)}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title="Delete Application"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={8} className="text-center py-8 text-muted-foreground text-xs">
                No agency applications found yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
