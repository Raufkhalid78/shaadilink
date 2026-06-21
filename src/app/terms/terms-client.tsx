"use client";

import { LegalPage } from "@/components/flow/legal-page";
import { useRouter } from "next/navigation";

export default function TermsClientPage() {
  const router = useRouter();
  return <LegalPage type="terms" onBack={() => router.push("/")} />;
}
