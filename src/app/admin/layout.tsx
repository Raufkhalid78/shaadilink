import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth-helpers';
import Link from 'next/link';
import { LayoutDashboard, MessageSquare, ShoppingBag, Users, LogOut, Mailbox, Settings, Ticket, Briefcase } from 'lucide-react';
import { AdminMobileHeader } from '@/components/admin/admin-mobile-header';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireAdmin();
  } catch (err: any) {
    if (err?.status === 401) {
      redirect('/login?redirect=/admin');
    }
    redirect('/dashboard?error=admin_access_required');
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Top Navigation & Quick Switcher */}
      <AdminMobileHeader />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:border-r border-border/50 bg-card/30 flex-col shrink-0">
        <div className="p-6 border-b border-border/50">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display font-bold text-xl tracking-tight text-gold">
              Smart <span className="text-foreground">Invites</span>
            </span>
          </Link>
          <div className="mt-2 text-[10px] font-mono text-muted-foreground uppercase tracking-wider bg-gold/10 text-gold px-2 py-0.5 rounded-full inline-block">
            Admin Portal
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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
          <div className="pt-4 pb-1">
            <div className="px-3 text-xs font-semibold text-muted-foreground/50 uppercase tracking-wider">Management</div>
          </div>
          <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-gold/10 hover:text-gold transition-colors">
            <Users className="w-4 h-4" /> Users
          </Link>
          <Link href="/admin/coupons" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-gold/10 hover:text-gold transition-colors">
            <Ticket className="w-4 h-4" /> Coupons
          </Link>
          <Link href="/admin/subscribers" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-gold/10 hover:text-gold transition-colors">
            <Mailbox className="w-4 h-4" /> Subscribers
          </Link>
          <Link href="/admin/affiliates" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-gold/10 hover:text-gold transition-colors">
            <Users className="w-4 h-4" /> Affiliates
          </Link>
          <Link href="/admin/agency" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-gold/10 hover:text-gold transition-colors">
            <Briefcase className="w-4 h-4 text-gold" /> Agencies &amp; Credits
          </Link>
          <div className="pt-4 pb-1">
            <div className="px-3 text-xs font-semibold text-muted-foreground/50 uppercase tracking-wider">System</div>
          </div>
          <Link href="/admin/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-gold/10 hover:text-gold transition-colors">
            <Settings className="w-4 h-4" /> Settings
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
