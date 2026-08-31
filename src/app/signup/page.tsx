"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SignupPage } from "@/components/flow/signup-page";
import { useFlowStore } from "@/lib/store";
import { Loader2 } from "lucide-react";

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/dashboard";
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
      onContinue={() => router.push(nextUrl)}
      onLogin={() => router.push(`/login?next=${encodeURIComponent(nextUrl)}`)}
      crumbs={[
        { label: "Home", onClick: () => router.push("/") },
        ...(flowData.userId ? [{ label: "Dashboard", onClick: () => router.push("/dashboard") }] : []),
        { label: "Templates", onClick: () => router.push("/templates") },
        { label: "Create Account" },
      ]}
    />
  );
}

export default function SignupRoute() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gold" /></div>}>
      <SignupContent />
    </Suspense>
  );
}
