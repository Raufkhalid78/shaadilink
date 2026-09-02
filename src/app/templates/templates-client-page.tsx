"use client";

import { useRouter } from "next/navigation";
import { TemplatesPage } from "@/components/landing/templates-page";
import { Suspense, useEffect, useState } from "react";
import { useFlowStore } from "@/lib/store";

export default function TemplatesClientPage() {
  const router = useRouter();
  const { flowData, setFlowData, resetFlowData } = useFlowStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSelectTemplate = async (id: string, plan: "classic" | "royal") => {
    localStorage.removeItem("shaadilink_pending_flow_data");
    localStorage.removeItem("shaadilink_oauth_in_progress");
    resetFlowData();
    setFlowData({ selectedTemplateId: id, selectedPlan: plan });
    
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        router.push("/signup?next=/create");
        return;
      }
    } catch (e) {
      console.error("Auth check failed:", e);
    }

    router.push("/create");
  };

  if (!mounted) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<div className="min-h-screen" />}>
        <TemplatesPage
          selectedPlan={(flowData.selectedPlan as "classic" | "royal") || "classic"}
          onBack={() => router.push("/")}
          onPreview={(id) => router.push(`/demo/${id}`)}
          onSelectTemplate={handleSelectTemplate}
        />
      </Suspense>
    </div>
  );
}
