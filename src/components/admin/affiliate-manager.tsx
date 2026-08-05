'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import { updateAffiliateStatus, deleteAffiliate } from '@/app/admin/affiliates/actions';
import { toast } from 'sonner';

export function AffiliateManager({ affiliates }: { affiliates: any[] }) {
  const [data, setData] = useState(affiliates);

  async function handleStatusChange(id: string, newStatus: 'approved' | 'rejected') {
    const res = await updateAffiliateStatus(id, newStatus);
    if (res.error) {
      toast.error(res.error);
    } else {
      setData(data.map(a => a.id === id ? { ...a, status: newStatus } : a));
      toast.success(`Application ${newStatus}`);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this application?')) return;
    
    const res = await deleteAffiliate(id);
    if (res.error) {
      toast.error(res.error);
    } else {
      setData(data.filter(a => a.id !== id));
      toast.success('Application deleted');
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-muted-foreground uppercase bg-muted/20">
          <tr>
            <th className="px-4 py-3 rounded-tl-lg">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Social Link</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Applied On</th>
            <th className="px-4 py-3 rounded-tr-lg text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {data?.length ? (
            data.map((a: any) => (
              <tr key={a.id} className="hover:bg-muted/10 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{a.name}</td>
                <td className="px-4 py-3">{a.email}</td>
                <td className="px-4 py-3 max-w-[200px] truncate">
                  {a.social_link ? (
                    <a href={a.social_link} target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:underline">
                      Link
                    </a>
                  ) : '-'}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${a.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : a.status === 'rejected' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                    {a.status || 'pending'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground">
                  {new Date(a.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {a.status !== 'approved' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10 h-8 px-2"
                        onClick={() => handleStatusChange(a.id, 'approved')}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </Button>
                    )}
                    {a.status !== 'rejected' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-amber-500 border-amber-500/30 hover:bg-amber-500/10 h-8 px-2"
                        onClick={() => handleStatusChange(a.id, 'rejected')}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDelete(a.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10 h-8 px-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                No affiliate applications found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
