"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DashboardPage } from "@/components/flow/dashboard-page";
import { Loader2, Crown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { FlowData } from "@/lib/flow-types";
import { initialFlowData } from "@/lib/flow-types";
import { useFlowStore } from "@/lib/store";

export default function DashboardRoutePage() {
  const router = useRouter();
  const { flowData, setFlowData, resetFlowData } = useFlowStore();
  const [ready, setReady] = useState(false);
  const [isAgencyUser, setIsAgencyUser] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Supabase session fetch error:", error);
          toast.error("Authentication error. Redirecting to login...");
          router.replace("/login?next=/dashboard");
          return;
        }

        let currentUser = session?.user;
        if (!currentUser) {
          // Fallback to getUser() in case session cookies are refreshed
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            toast.info("Please sign in to access your dashboard.");
            router.replace("/login?next=/dashboard");
            return;
          }
          currentUser = user;
        }

        setFlowData((prev) => ({
          ...prev,
          userId: currentUser!.id,
          email: currentUser!.email ?? "",
          fullName: currentUser!.user_metadata?.full_name ?? "",
        }));

        // Check if user is an approved Agency Partner
        try {
          const agencyRes = await fetch("/api/agency/status").then((r) => r.json()).catch(() => null);
          if (agencyRes?.isAgency && agencyRes?.status === "approved") {
            setIsAgencyUser(true);
            const searchParams = new URLSearchParams(window.location.search);
            const isPersonalView = searchParams.get("view") === "personal" || (typeof window !== "undefined" && window.sessionStorage?.getItem("smartinvites_preferred_dashboard") === "personal");
            if (searchParams.get("view") === "personal" && typeof window !== "undefined") {
              window.sessionStorage?.setItem("smartinvites_preferred_dashboard", "personal");
            }
            if (!isPersonalView) {
              router.replace("/dashboard/agency");
              return;
            }
          } else {
            // Normal user or rejected/pending application: always stay on personal host dashboard
            setIsAgencyUser(false);
          }
        } catch (e) {
          console.error("Agency status check error:", e);
        }

        setReady(true);
      } catch (err) {
        console.error("Dashboard checkAuth error:", err);
        toast.error("An unexpected error occurred. Redirecting to login...");
        router.replace("/login?next=/dashboard");
      }
    };
    
    checkAuth();
  }, [router, setFlowData]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {isAgencyUser && (
        <div className="bg-gradient-to-r from-amber-500/15 via-gold/15 to-amber-500/15 border-b border-gold/30 px-4 py-2.5 flex items-center justify-between text-xs text-foreground shrink-0 shadow-sm">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-gold shrink-0" />
            <span className="font-semibold text-gold">Agency Partner Account:</span>
            <span className="text-muted-foreground hidden sm:inline">
              You are currently viewing your personal retail invitations.
            </span>
          </div>
          <Button
            size="sm"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.sessionStorage?.removeItem("smartinvites_preferred_dashboard");
              }
              router.push("/dashboard/agency");
            }}
            className="bg-primary hover:bg-primary-light text-slate-950 text-xs font-bold gap-1 h-7 px-3"
          >
            Switch to Agency Portal <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </Button>
        </div>
      )}
      <div className="flex-1">
        <DashboardPage
          flowData={flowData}
          onCreateNew={() => {
            resetFlowData();
            if (typeof window !== "undefined") {
              localStorage.removeItem("smartinvites_pending_flow_data");
            }
            router.push("/templates");
          }}
          onViewInvitation={(id) => router.push(`/inv/${id}`)}
          onEditInvitation={(id) => router.push(`/create?edit=${id}`)}
          onSignOut={() => router.replace("/")}
          onUpgradeInvitation={(id) => router.push(`/payment?upgrade=${id}`)}
          onBuyMoreLinks={(id) => router.push(`/payment?buyMoreLinks=${id}`)}
          onGoHome={() => router.push("/")}
        />
      </div>
    </div>
  );
}
