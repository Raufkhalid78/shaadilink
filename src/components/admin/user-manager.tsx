'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

export function UserManager({ users }: { users: any[] }) {
  
  function handleExportCSV() {
    if (users.length === 0) {
      toast.error('No users to export');
      return;
    }
    
    const headers = ['Email', 'Provider', 'Registered On'];
    const csvData = users.map(u => [
      u.email,
      u.app_metadata?.provider || 'Email',
      new Date(u.created_at).toLocaleDateString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `registered_users_${new Date().toISOString().split('T')[0]}.csv`);
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
              <th className="px-4 py-3">Auth Provider</th>
              <th className="px-4 py-3 rounded-tr-lg text-right">Registered On</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {users?.length ? (
              users.map((u: any) => (
                <tr key={u.id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{u.email}</td>
                  <td className="px-4 py-3 capitalize">{u.app_metadata?.provider || 'Email'}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                  No registered users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
