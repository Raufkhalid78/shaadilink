"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  MessageSquare,
  Mailbox,
  Ticket,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const NAV_ITEMS = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Settings", href: "/admin/settings", icon: Settings },
  { label: "Invitations", href: "/admin/invitations", icon: Users },
  { label: "Agencies", href: "/admin/agency", icon: Briefcase },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Messages", href: "/admin/messages", icon: Mailbox },
  { label: "Reviews", href: "/admin/reviews", icon: MessageSquare },
  { label: "Coupons", href: "/admin/coupons", icon: Ticket },
  { label: "Subscribers", href: "/admin/subscribers", icon: Mailbox },
  { label: "Affiliates", href: "/admin/affiliates", icon: Users },
];

export function AdminMobileHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden sticky top-0 z-40 bg-card/95 border-b border-border/60 backdrop-blur-xl">
      {/* Top row: Brand & Sheet trigger */}
      <div className="px-4 py-3 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="font-display font-bold text-lg tracking-tight text-gold">
            Smart <span className="text-foreground">Invites</span>
          </span>
          <span className="text-[10px] font-mono uppercase tracking-wider bg-gold/15 text-gold px-2 py-0.5 rounded-full border border-gold/30">
            Admin
          </span>
        </Link>

        <div className="flex items-center gap-1.5">
          <Link
            href="/dashboard"
            className="text-xs text-muted-foreground hover:text-foreground px-2.5 py-1 rounded-lg border border-border/40 hover:bg-muted/40 transition-colors"
          >
            Exit
          </Link>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground">
                <Menu className="w-5 h-5" />
                <span className="sr-only">Open Admin Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] bg-card/95 backdrop-blur-2xl border-r border-border/60 p-0 flex flex-col">
              <SheetHeader className="p-5 border-b border-border/50 text-left">
                <SheetTitle className="font-display font-bold text-lg text-gold flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Admin Portal
                </SheetTitle>
              </SheetHeader>

              <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-gold/15 text-gold border border-gold/30 shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-border/50">
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Exit Admin Portal
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Horizontal pill navigation bar */}
      <div className="px-3 pb-2.5 overflow-x-auto no-scrollbar flex items-center gap-1.5 scroll-smooth">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-all ${
                isActive
                  ? "bg-gold text-black font-bold shadow-sm"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/70 border border-border/30"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
