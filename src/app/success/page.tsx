"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SuccessPage } from "@/components/flow/success-page";
import { useFlowStore } from "@/lib/store";
import { Loader2 } from "lucide-react";

export default function SuccessRoute() {
  const router = useRouter();
  const { flowData, resetFlowData } = useFlowStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <SuccessPage
      flowData={flowData}
      onViewInvitation={() => {
        resetFlowData();
        const url = flowData.invitationId
          ? `/inv/${flowData.slug || flowData.invitationId}`
          : `/demo/${flowData.selectedTemplateId || "emerald-noir"}`;
        router.push(url);
      }}
      onGoToDashboard={() => {
        resetFlowData();
        router.push("/dashboard");
      }}
      crumbs={[
        { label: "Home", onClick: () => router.push("/") },
        ...(flowData.userId ? [{ label: "Dashboard", onClick: () => router.push("/dashboard") }] : []),
        { label: "Templates", onClick: () => router.push("/templates") },
        { label: "Success" },
      ]}
    />
  );
}
