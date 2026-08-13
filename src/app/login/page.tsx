"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoginPage } from "@/components/flow/login-page";
import { useFlowStore } from "@/lib/store";
import { Loader2 } from "lucide-react";

export default function LoginRoute() {
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
    <LoginPage
      onBack={() => router.push("/")}
      onLogin={(userId, email, fullName) => {
        setFlowData({ userId, email, fullName: fullName || "" });
        router.push("/dashboard");
      }}
      onSignup={() => router.push("/signup")}
      crumbs={[
        { label: "Home", onClick: () => router.push("/") },
        ...(flowData.userId ? [{ label: "Dashboard", onClick: () => router.push("/dashboard") }] : []),
        { label: "Login" },
      ]}
    />
  );
}
