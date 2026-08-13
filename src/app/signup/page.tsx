"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SignupPage } from "@/components/flow/signup-page";
import { useFlowStore } from "@/lib/store";
import { Loader2 } from "lucide-react";

export default function SignupRoute() {
  const router = useRouter();
  const { flowData, setFlowData } = useFlowStore();
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
    <SignupPage
      flowData={flowData}
      onUpdateData={(updates) => setFlowData(updates)}
      onBack={() => router.push("/templates")}
      onContinue={() => router.push("/create")}
      onLogin={() => router.push("/login")}
      crumbs={[
        { label: "Home", onClick: () => router.push("/") },
        ...(flowData.userId ? [{ label: "Dashboard", onClick: () => router.push("/dashboard") }] : []),
        { label: "Templates", onClick: () => router.push("/templates") },
        { label: "Create Account" },
      ]}
    />
  );
}
