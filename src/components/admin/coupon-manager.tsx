'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2 } from 'lucide-react';
import { addCoupon, deleteCoupon } from '@/app/admin/coupons/actions';

export function CouponManager({ coupons }: { coupons: any[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(formData: FormData) {
    setLoading(true);
    setError(null);
    const res = await addCoupon(formData);
    setLoading(false);
    
    if (res.error) {
      setError(res.error);
    } else {
      setOpen(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    await deleteCoupon(id);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gold text-emerald-dark hover:bg-gold-light">
              <Plus className="w-4 h-4" /> Add Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border/50">
            <DialogHeader>
              <DialogTitle>Add New Coupon</DialogTitle>
            </DialogHeader>
            <form action={handleAdd} className="space-y-4">
              {error && <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-md">{error}</div>}
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Coupon Code</label>
                <Input name="code" required placeholder="e.g. SUMMER20" className="uppercase bg-background" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Discount Percent (%)</label>
                <Input name="discount_percent" type="number" min="1" max="100" required placeholder="e.g. 15" className="bg-background" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Max Uses (Optional)</label>
                <Input name="max_uses" type="number" min="1" placeholder="Leave empty for unlimited" className="bg-background" />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={loading} className="bg-emerald hover:bg-emerald/90">
                  {loading ? 'Adding...' : 'Add Coupon'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/20">
            <tr>
              <th className="px-4 py-3 rounded-tl-lg">Code</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Uses</th>
              <th className="px-4 py-3 text-right">Created On</th>
              <th className="px-4 py-3 rounded-tr-lg text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {coupons?.length ? (
              coupons.map((c: any) => (
                <tr key={c.id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{c.code}</td>
                  <td className="px-4 py-3">{c.discount_percent}% OFF</td>
                  <td className="px-4 py-3">{c.current_uses} {c.max_uses ? `/ ${c.max_uses}` : ''}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground" suppressHydrationWarning>
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDelete(c.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No coupons found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
