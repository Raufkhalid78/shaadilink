import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { LayoutDashboard, MessageSquare, ShoppingBag, Users, LogOut, Mailbox } from 'lucide-react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session || session.user.email !== process.env.ADMIN_EMAIL) {
    redirect('/dashboard'); // redirect unauthorized users
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border/50 bg-card/30 flex flex-col">
        <div className="p-6 border-b border-border/50">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display font-bold text-xl tracking-tight text-gold">
              Shaadi<span className="text-foreground">Link</span>
            </span>
          </Link>
          <div className="mt-2 text-[10px] font-mono text-muted-foreground uppercase tracking-wider bg-gold/10 text-gold px-2 py-0.5 rounded-full inline-block">
            Admin Portal
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-gold/10 hover:text-gold transition-colors">
            <LayoutDashboard className="w-4 h-4" /> Overview
          </Link>
          <Link href="/admin/invitations" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-gold/10 hover:text-gold transition-colors">
            <Users className="w-4 h-4" /> Invitations
          </Link>
          <Link href="/admin/orders" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-gold/10 hover:text-gold transition-colors">
            <ShoppingBag className="w-4 h-4" /> Orders
          </Link>
          <Link href="/admin/reviews" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-gold/10 hover:text-gold transition-colors">
            <MessageSquare className="w-4 h-4" /> Reviews
          </Link>
          <Link href="/admin/messages" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-gold/10 hover:text-gold transition-colors">
            <Mailbox className="w-4 h-4" /> Messages
          </Link>
        </nav>

        <div className="p-4 border-t border-border/50">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
            <LogOut className="w-4 h-4" /> Exit Admin
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
