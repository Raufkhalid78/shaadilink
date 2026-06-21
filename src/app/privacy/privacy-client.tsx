"use client";

import { LegalPage } from "@/components/flow/legal-page";
import { useRouter } from "next/navigation";

export default function PrivacyClientPage() {
  const router = useRouter();
  return <LegalPage type="privacy" onBack={() => router.push("/")} />;
}
