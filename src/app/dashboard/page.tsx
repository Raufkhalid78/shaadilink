"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DashboardPage } from "@/components/flow/dashboard-page";
import { Loader2 } from "lucide-react";
import type { FlowData } from "@/lib/flow-types";
import { initialFlowData } from "@/lib/flow-types";

export default function DashboardRoutePage() {
  const router = useRouter();
  const [flowData, setFlowData] = useState<FlowData>(initialFlowData);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        // Not logged in — redirect to home
        router.replace("/");
        return;
      }
      
      setFlowData({
        ...initialFlowData,
        userId: session.user.id,
        email: session.user.email ?? "",
        fullName: session.user.user_metadata?.full_name ?? "",
      });
      setReady(true);
    };
    
    checkAuth();
  }, [router]);

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
      onCreateNew={() => router.push("/?start=create")}
      onViewInvitation={(id) => router.push(`/inv/${id}`)}
      onEditInvitation={(id) => router.push(`/?edit=${id}`)}
      onSignOut={() => router.replace("/")}
      onUpgradeInvitation={(id) => router.push(`/?upgrade=${id}`)}
      onGoHome={() => router.push("/")}
    />
  );
}
