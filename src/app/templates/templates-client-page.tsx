"use client";

import { useRouter } from "next/navigation";
import { TemplatesPage } from "@/components/landing/templates-page";
import { Suspense } from "react";
import { useFlowStore } from "@/lib/store";

export default function TemplatesClientPage() {
  const router = useRouter();
  const { setFlowData } = useFlowStore();

  const handleSelectTemplate = (id: string, plan: "classic" | "royal") => {
    localStorage.removeItem("shaadilink_pending_flow_data");
    localStorage.removeItem("shaadilink_oauth_in_progress");
    setFlowData({ selectedTemplateId: id, selectedPlan: plan });
    router.push("/create");
  };

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<div className="min-h-screen" />}>
        <TemplatesPage
          selectedPlan="royal"
          onBack={() => router.push("/")}
          onPreview={(id) => router.push(`/demo/${id}`)}
          onSelectTemplate={handleSelectTemplate}
        />
      </Suspense>
    </div>
  );
}
