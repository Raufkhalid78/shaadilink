"use client";

import { AboutPage } from "@/components/flow/about-page";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  return <AboutPage onBack={() => router.push("/")} />;
}
