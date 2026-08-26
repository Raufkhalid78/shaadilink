import { createServiceClient } from '@/lib/supabase/server';
import ReviewsClient from './reviews-client';

export const dynamic = 'force-dynamic';

export default async function AdminReviewsPage() {
  const supabase = createServiceClient();

  const { data: reviews, error } = await supabase
    .from('reviews')
    .select(`
      id,
      rating,
      message,
      is_approved,
      template_name,
      created_at,
      invitations(partner1_name, partner2_name, venue)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    return <div>Error loading reviews.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display tracking-tight">Review Moderation</h1>
        <p className="text-muted-foreground text-sm">Approve or delete user reviews before they appear on the homepage.</p>
      </div>
      <ReviewsClient initialReviews={reviews || []} />
    </div>
  );
}
