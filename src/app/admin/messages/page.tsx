import { createServiceClient } from '@/lib/supabase/server';
import MessagesClient from './messages-client';

export const dynamic = 'force-dynamic';

export default async function AdminMessagesPage() {
  const supabase = createServiceClient();

  const { data: messages, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    return <div>Error loading messages.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display tracking-tight">Messages</h1>
        <p className="text-muted-foreground text-sm">Read and manage messages submitted via the Contact Us form.</p>
      </div>

      <MessagesClient initialMessages={messages || []} />
    </div>
  );
}
