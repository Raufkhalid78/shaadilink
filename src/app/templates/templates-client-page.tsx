"use client";

import { useRouter } from "next/navigation";
import { TemplatesPage } from "@/components/landing/templates-page";
import { Suspense } from "react";

export default function TemplatesClientPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<div className="min-h-screen" />}>
        <TemplatesPage
          selectedPlan="royal"
          onBack={() => router.push("/")}
          onPreview={(id) => router.push(`/?start=demo&template=${id}`)}
          onSelectTemplate={(id) => router.push(`/?start=create&template=${id}`)}
        />
      </Suspense>
    </div>
  );
}
