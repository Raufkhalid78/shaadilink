'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Trash2 } from 'lucide-react';
import { deleteSubscriber } from '@/app/admin/subscribers/actions';
import { toast } from 'sonner';

export function SubscriberManager({ subscribers }: { subscribers: any[] }) {
  const [data, setData] = useState(subscribers);

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this subscriber?')) return;
    
    const res = await deleteSubscriber(id);
    if (res.error) {
      toast.error(res.error);
    } else {
      setData(data.filter(s => s.id !== id));
      toast.success('Subscriber deleted');
    }
  }

  function handleExportCSV() {
    if (data.length === 0) {
      toast.error('No subscribers to export');
      return;
    }
    
    const headers = ['Email', 'Status', 'Subscribed On'];
    const csvData = data.map(s => [
      s.email,
      s.status || 'Active',
      new Date(s.created_at).toLocaleDateString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `subscribers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleExportCSV} variant="outline" className="gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/20">
            <tr>
              <th className="px-4 py-3 rounded-tl-lg">Email</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Subscribed On</th>
              <th className="px-4 py-3 rounded-tr-lg text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {data?.length ? (
              data.map((s: any) => (
                <tr key={s.id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{s.email}</td>
                  <td className="px-4 py-3 capitalize text-emerald-500">{s.status || 'Active'}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {new Date(s.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDelete(s.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No subscribers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
