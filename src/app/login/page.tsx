"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoginPage } from "@/components/flow/login-page";
import { useFlowStore } from "@/lib/store";
import { Loader2 } from "lucide-react";

function LoginContent() {
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
    <LoginPage
      onBack={() => router.push("/")}
      onLogin={(userId, email, fullName) => {
        setFlowData({ userId, email, fullName: fullName || "" });
        router.push(nextUrl);
      }}
      onSignup={() => router.push(`/signup?next=${encodeURIComponent(nextUrl)}`)}
      crumbs={[
        { label: "Home", onClick: () => router.push("/") },
        ...(flowData.userId ? [{ label: "Dashboard", onClick: () => router.push("/dashboard") }] : []),
        { label: "Login" },
      ]}
    />
  );
}

export default function LoginRoute() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gold" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
