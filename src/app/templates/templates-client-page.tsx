"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { TemplatesPage } from "@/components/landing/templates-page";
import { CategorySelector } from "@/components/landing/category-selector";
import { Suspense, useEffect, useState } from "react";
import { useFlowStore } from "@/lib/store";
import { Crown } from "lucide-react";
import Link from "next/link";

export default function TemplatesClientPage({
  initialCategory,
  isAgency = false,
}: {
  initialCategory?: string | null;
  isAgency?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAgencyMode = isAgency || searchParams.get("agency") === "true";
  const { flowData, setFlowData, resetFlowData } = useFlowStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory || null);

  const handleSelectTemplate = async (id: string, plan: "classic" | "royal", categoryOverride?: string) => {
    localStorage.removeItem("smartinvites_pending_flow_data");
    localStorage.removeItem("smartinvites_oauth_in_progress");
    resetFlowData();

    const { getDefaultEventsForCategory, getDefaultMusicForCategory, initialFlowData } = await import("@/lib/flow-types");
    const category = categoryOverride?.toLowerCase() || selectedCategory || "wedding";
    
    // Completely fresh invitation state: no previous draft data, starts at step 1
    setFlowData({ 
      ...initialFlowData,
      userId: flowData.userId,
      email: flowData.email,
      fullName: flowData.fullName,
      selectedTemplateId: id, 
      selectedPlan: plan, 
      category,
      currentStep: 1,
      lastSavedStep: 1,
      invitationId: undefined,
      paymentDone: false,
      partner1Name: "",
      partner2Name: "",
      venue: "",
      venueAddress: "",
      slug: "",
      welcomeMessage: "",
      heroImage: "",
      slideshowImages: [],
      youtubeVideoId: "",
      customMusicUrl: "",
      customMusicName: "",
      voiceNoteUrl: "",
      voiceNoteTitle: "",
      voiceNoteSender: "",
      primaryHostFamily: "",
      secondaryHostFamily: "",
      primaryHostCity: "",
      secondaryHostCity: "",
      contactPhone: "",
      dressCodeWomen: "",
      dressCodeMen: "",
      transportation: "",
      accommodation: "",
      gifts: "",
      events: getDefaultEventsForCategory(category),
      backgroundMusic: getDefaultMusicForCategory(category),
      showBismillah: category.toLowerCase() === "wedding",
      showQuranVerse: category.toLowerCase() === "wedding",
    });
    
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        const nextUrl = isAgencyMode ? "/create?agency=true" : "/create";
        router.push(`/signup?next=${encodeURIComponent(nextUrl)}`);
        return;
      }
    } catch (e) {
      console.error("Auth check failed:", e);
    }

    router.push(isAgencyMode ? "/create?agency=true" : "/create");
  };

  if (!selectedCategory) {
    return (
      <CategorySelector
        onSelect={setSelectedCategory}
        isAgency={isAgencyMode}
        crumbs={[
          ...(isAgencyMode ? [{ label: "Agency Dashboard", href: "/dashboard/agency" }] : [{ label: "Home", href: "/" }]),
          { label: "Select Event Category" },
        ]}
      />
    );
  }

  const categoryLabels: Record<string, string> = {
    wedding: "Weddings & Marriages",
    school: "School & College",
    birthday: "Birthdays & Parties",
    meeting: "Meetings & Corporate",
    corporate: "Meetings & Corporate",
  };
  const catTitle = selectedCategory ? (categoryLabels[selectedCategory.toLowerCase()] || selectedCategory) : "All";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {isAgencyMode && (
        <div className="bg-gradient-to-r from-gold/15 via-gold/10 to-gold/15 border-b border-gold/30 px-4 py-2.5 text-center text-xs text-foreground flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 mx-auto sm:mx-0">
            <Crown className="w-4 h-4 text-gold shrink-0" />
            <span className="font-semibold text-gold">Agency Partner Mode:</span>
            <span className="text-muted-foreground hidden sm:inline">
              Select a luxury template for your client. 1 Wholesale Credit will be used to publish.
            </span>
          </div>
          <Link
            href="/dashboard/agency"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-gold hover:text-white underline ml-4"
          >
            ← Back to Agency Portal
          </Link>
        </div>
      )}
      <Suspense fallback={<div className="min-h-screen" />}>
        <TemplatesPage
          selectedPlan={(flowData.selectedPlan as "classic" | "royal") || "classic"}
          selectedCategory={selectedCategory}
          onBack={() => setSelectedCategory(null)}
          onPreview={(id) => router.push(`/demo/${id}`)}
          onSelectTemplate={handleSelectTemplate}
          crumbs={[
            ...(isAgencyMode ? [{ label: "Agency Dashboard", href: "/dashboard/agency" }] : [{ label: "Home", href: "/" }]),
            { label: "Categories", onClick: () => setSelectedCategory(null) },
            { label: `${catTitle} Templates` },
          ]}
        />
      </Suspense>
    </div>
  );
}
