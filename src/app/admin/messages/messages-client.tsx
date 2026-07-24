"use client";

import { useState } from 'react';
import { toast } from 'sonner';
import { Trash2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deleteContactMessage } from './actions';

export default function MessagesClient({ initialMessages }: { initialMessages: any[] }) {
  const [messages, setMessages] = useState(initialMessages);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    setDeletingId(id);

    try {
      await deleteContactMessage(id);
      setMessages(messages.filter(m => m.id !== id));
      toast.success('Message deleted successfully');
    } catch (error) {
      toast.error('Failed to delete message');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="grid gap-4">
      {messages.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl">
          No messages found.
        </div>
      ) : (
        messages.map((msg) => (
          <div key={msg.id} className="p-4 rounded-xl border border-border/50 bg-card/30 flex flex-col gap-4">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald" />
                  <span className="font-semibold">{msg.name}</span>
                </div>
                <p className="text-sm text-gold">
                  <a href={`mailto:${msg.email}`} className="hover:underline">{msg.email}</a>
                </p>
                <p className="text-xs text-muted-foreground/60" suppressHydrationWarning>
                  {new Date(msg.created_at).toLocaleString()}
                </p>
              </div>
              
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleDelete(msg.id)}
                disabled={deletingId === msg.id}
                className="border-red-500/30 text-red-500 hover:bg-red-500/10 shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="p-4 rounded-lg bg-muted/50 text-sm whitespace-pre-wrap">
              {msg.message}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
