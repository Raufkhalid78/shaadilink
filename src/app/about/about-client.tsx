"use client";

import { AboutPage } from "@/components/flow/about-page";
import { useRouter } from "next/navigation";

export default function AboutClientPage() {
  const router = useRouter();
  return <AboutPage onBack={() => router.push("/")} />;
}
