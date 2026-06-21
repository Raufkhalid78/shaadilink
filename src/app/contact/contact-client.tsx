"use client";

import { ContactPage } from "@/components/flow/contact-page";
import { useRouter } from "next/navigation";

export default function ContactClientPage() {
  const router = useRouter();
  return <ContactPage onBack={() => router.push("/")} />;
}
