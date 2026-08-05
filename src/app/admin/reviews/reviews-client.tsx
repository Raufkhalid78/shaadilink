'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Trash2, Star, CheckSquare, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ReviewsClient({ initialReviews }: { initialReviews: any[] }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const supabase = createClient();

  const handleToggleApproval = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const { error } = await supabase
      .from('reviews')
      .update({ is_approved: newStatus })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update review status');
      return;
    }

    setReviews(reviews.map(r => r.id === id ? { ...r, is_approved: newStatus } : r));
    toast.success(newStatus ? 'Review approved' : 'Review hidden');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete review');
      return;
    }

    setReviews(reviews.filter(r => r.id !== id));
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    toast.success('Review deleted');
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === reviews.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(reviews.map(r => r.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkAction = async (action: 'approve' | 'hide' | 'delete') => {
    if (selectedIds.size === 0) return;
    
    if (action === 'delete' && !confirm(`Are you sure you want to delete ${selectedIds.size} reviews?`)) return;

    try {
      if (action === 'delete') {
        const { error } = await supabase
          .from('reviews')
          .delete()
          .in('id', Array.from(selectedIds));
        
        if (error) throw error;
        
        setReviews(reviews.filter(r => !selectedIds.has(r.id)));
        toast.success(`Deleted ${selectedIds.size} reviews`);
      } else {
        const isApproved = action === 'approve';
        const { error } = await supabase
          .from('reviews')
          .update({ is_approved: isApproved })
          .in('id', Array.from(selectedIds));

        if (error) throw error;

        setReviews(reviews.map(r => selectedIds.has(r.id) ? { ...r, is_approved: isApproved } : r));
        toast.success(`${action === 'approve' ? 'Approved' : 'Hidden'} ${selectedIds.size} reviews`);
      }
      setSelectedIds(new Set());
    } catch (e: any) {
      toast.error(e.message || `Failed to perform bulk action`);
    }
  };

  return (
    <div className="space-y-4">
      {reviews.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-border/50">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={toggleSelectAll} className="gap-2">
              {selectedIds.size === reviews.length ? <CheckSquare className="w-4 h-4"/> : <Square className="w-4 h-4"/>}
              {selectedIds.size > 0 ? `Selected ${selectedIds.size}` : 'Select All'}
            </Button>
          </div>
          
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="text-emerald-500 hover:text-emerald-600" onClick={() => handleBulkAction('approve')}>
                <CheckCircle2 className="w-4 h-4 mr-2" /> Approve All
              </Button>
              <Button size="sm" variant="outline" className="text-amber-500 hover:text-amber-600" onClick={() => handleBulkAction('hide')}>
                <XCircle className="w-4 h-4 mr-2" /> Hide All
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleBulkAction('delete')}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete All
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4">
        {reviews.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl">
            No reviews found.
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className={`p-4 rounded-xl border transition-colors flex flex-col md:flex-row gap-4 justify-between ${selectedIds.has(review.id) ? 'border-primary bg-primary/5' : 'border-border/50 bg-card/30'}`}>
              <div className="flex gap-3 flex-1">
                <button onClick={() => toggleSelect(review.id)} className="mt-1 text-muted-foreground hover:text-foreground transition-colors">
                  {selectedIds.has(review.id) ? <CheckSquare className="w-4 h-4 text-primary"/> : <Square className="w-4 h-4"/>}
                </button>
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">
                      {review.invitations?.partner1_name} & {review.invitations?.partner2_name}
                    </span>
                    <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-muted">
                      {review.template_name || 'Template'}
                    </span>
                    <div className="flex items-center text-gold">
                      {[...Array(review.rating)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                    </div>
                  </div>
                  <p className="text-sm italic text-muted-foreground">"{review.message}"</p>
                  <p className="text-xs text-muted-foreground/50">
                    Submitted on {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={review.is_approved ? "outline" : "default"}
                  className={review.is_approved ? "text-amber-500 border-amber-500/30 hover:bg-amber-500/10" : "bg-emerald text-white hover:bg-emerald-dark"}
                  onClick={() => handleToggleApproval(review.id, review.is_approved)}
                >
                  {review.is_approved ? <><XCircle className="w-4 h-4 mr-1" /> Hide</> : <><CheckCircle2 className="w-4 h-4 mr-1" /> Approve</>}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(review.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
