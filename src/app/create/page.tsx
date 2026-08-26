"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DetailsPage } from "@/components/flow/details-page";
import { useFlowStore } from "@/lib/store";
import { Loader2 } from "lucide-react";

export default function CreateRoute() {
  const router = useRouter();
  const { flowData, setFlowData } = useFlowStore();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const editId = searchParams.get("edit");

    if (editId) {
      fetch(`/api/invitations/${editId}`)
        .then((r) => r.json())
        .then(({ invitation }) => {
          if (invitation) {
            const p1 = invitation.partner1_name ?? "";
            const p2 = invitation.partner2_name ?? "";
            const venue = invitation.venue ?? "";
            const hero = invitation.hero_image_url;
            const music = invitation.background_music;

            let resumeStep = 1;
            if (p1 && p2) {
              if (venue) {
                if (hero || (music && music !== 'no-music' && music !== 'soft-sitar')) {
                  resumeStep = 4;
                } else {
                  resumeStep = 3;
                }
              } else {
                resumeStep = 2;
              }
            }

            setFlowData({
              invitationId: invitation.id,
              selectedTemplateId: invitation.template_id,
              partner1Name: p1,
              partner2Name: p2,
              venue: venue,
              venueAddress: invitation.venue_address ?? "",
              welcomeMessage: invitation.welcome_message ?? "",
              backgroundMusic: invitation.background_music ?? "shaadi-classic",
              guestLinksQuota: invitation.guest_links_quota ?? 10,
              originalGuestLinksQuota: invitation.guest_links_quota ?? 0,
              events: ((invitation.events as { name: string; date: string; time: string; venue?: string; order_index: number }[]) || [])
                .sort((a, b) => a.order_index - b.order_index)
                .map((e) => ({ name: e.name, date: e.date, time: e.time, venue: e.venue })),
              selectedPlan: invitation.plan,
              paymentDone: invitation.is_active ?? false,
              slug: invitation.slug ?? "",
              showBismillah: invitation.show_bismillah ?? true,
              showQuranVerse: invitation.show_quran_verse ?? true,
              hostBrideFamily: invitation.host_bride_family ?? "",
              hostGroomFamily: invitation.host_groom_family ?? "",
              hostBrideCity: invitation.host_bride_city ?? "",
              hostGroomCity: invitation.host_groom_city ?? "",
              contactPhone: invitation.contact_phone ?? "",
              venueDetailsSegregated: invitation.venue_details_segregated ?? "",
              showNikahRegistration: invitation.show_nikah_registration ?? false,
              youtubeVideoId: invitation.youtube_video_id ?? "",
              currentStep: resumeStep,
              lastSavedStep: resumeStep,
            });
          }
        })
        .catch(console.error)
        .finally(() => {
          setMounted(true);
          setIsLoading(false);
        });
    } else {
      setMounted(true);
      setIsLoading(false);
    }
  }, [setFlowData]);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <DetailsPage
      flowData={flowData}
      onUpdateData={(updates) => setFlowData(updates)}
      onBack={() => router.push("/templates")}
      onContinue={() => router.push("/payment")}
      onRequireLogin={() => router.push("/login")}
      crumbs={[
        { label: "Home", onClick: () => router.push("/") },
        ...(flowData.userId ? [{ label: "Dashboard", onClick: () => router.push("/dashboard") }] : []),
        { label: "Templates", onClick: () => router.push("/templates") },
        { label: "Details" },
      ]}
    />
  );
}
