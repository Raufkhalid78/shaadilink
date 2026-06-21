"use client";

import { AffiliatePage } from "@/components/flow/affiliate-page";
import { useRouter } from "next/navigation";

export default function AffiliateClientPage() {
  const router = useRouter();
  return <AffiliatePage onBack={() => router.push("/")} />;
}
