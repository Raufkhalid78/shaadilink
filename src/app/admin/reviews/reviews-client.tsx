"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ReviewsClient({ initialReviews }: { initialReviews: any[] }) {
  const [reviews, setReviews] = useState(initialReviews);
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
    toast.success('Review deleted');
  };

  return (
    <div className="grid gap-4">
      {reviews.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl">
          No reviews found.
        </div>
      ) : (
        reviews.map((review) => (
          <div key={review.id} className="p-4 rounded-xl border border-border/50 bg-card/30 flex flex-col md:flex-row gap-4 justify-between">
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
  );
}
