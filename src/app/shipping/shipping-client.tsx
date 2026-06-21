"use client";

import { LegalPage } from "@/components/flow/legal-page";
import { useRouter } from "next/navigation";

export default function ShippingClientPage() {
  const router = useRouter();
  return <LegalPage type="shipping" onBack={() => router.push("/")} />;
}
