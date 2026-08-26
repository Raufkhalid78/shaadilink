"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DashboardPage } from "@/components/flow/dashboard-page";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { FlowData } from "@/lib/flow-types";
import { initialFlowData } from "@/lib/flow-types";
import { useFlowStore } from "@/lib/store";

export default function DashboardRoutePage() {
  const router = useRouter();
  const { flowData, setFlowData, resetFlowData } = useFlowStore();
  const [ready, setReady] = useState(false);

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

        if (!session?.user) {
          // Fallback to getUser() in case session cookies are refreshed
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            toast.info("Please sign in to access your dashboard.");
            router.replace("/login?next=/dashboard");
            return;
          }

          setFlowData((prev) => ({
            ...prev,
            userId: user.id,
            email: user.email ?? "",
            fullName: user.user_metadata?.full_name ?? "",
          }));
          setReady(true);
          return;
        }
        
        setFlowData((prev) => ({
          ...prev,
          userId: session.user.id,
          email: session.user.email ?? "",
          fullName: session.user.user_metadata?.full_name ?? "",
        }));
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
    <DashboardPage
      flowData={flowData}
      onCreateNew={() => router.push("/create")}
      onViewInvitation={(id) => router.push(`/inv/${id}`)}
      onEditInvitation={(id) => router.push(`/create?edit=${id}`)}
      onSignOut={() => router.replace("/")}
      onUpgradeInvitation={(id) => router.push(`/payment?upgrade=${id}`)}
      onBuyMoreLinks={(id) => router.push(`/payment?buyMoreLinks=${id}`)}
      onGoHome={() => router.push("/")}
    />
  );
}
