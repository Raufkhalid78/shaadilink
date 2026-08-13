"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PaymentPage } from "@/components/flow/payment-page";
import { useFlowStore } from "@/lib/store";
import { Loader2 } from "lucide-react";

export default function PaymentRoute() {
  const router = useRouter();
  const { flowData, setFlowData } = useFlowStore();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const upgradeId = searchParams.get("upgrade");
    const buyMoreLinksId = searchParams.get("buyMoreLinks");
    const targetId = upgradeId || buyMoreLinksId;

    if (targetId) {
      fetch(`/api/invitations/${targetId}`)
        .then((r) => r.json())
        .then(({ invitation }) => {
          if (invitation) {
            setFlowData({
              invitationId: invitation.id,
              selectedTemplateId: invitation.template_id,
              partner1Name: invitation.partner1_name ?? "",
              partner2Name: invitation.partner2_name ?? "",
              venue: invitation.venue ?? "",
              venueAddress: invitation.venue_address ?? "",
              welcomeMessage: invitation.welcome_message ?? "",
              backgroundMusic: invitation.background_music ?? "shaadi-classic",
              guestLinksQuota: invitation.guest_links_quota ?? 10,
              originalGuestLinksQuota: invitation.guest_links_quota ?? 0,
              events: ((invitation.events as { name: string; date: string; time: string; venue?: string; order_index: number }[]) || [])
                .sort((a, b) => a.order_index - b.order_index)
                .map((e) => ({ name: e.name, date: e.date, time: e.time, venue: e.venue })),
              selectedPlan: upgradeId ? "royal" : invitation.plan,
              originalPlan: invitation.plan,
              paymentDone: !upgradeId && (invitation.is_active ?? false),
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
    <PaymentPage
      flowData={flowData}
      onUpdateData={(updates) => setFlowData(updates)}
      onBack={() => router.push("/create")}
      onContinue={() => router.push("/success")}
      crumbs={[
        { label: "Home", onClick: () => router.push("/") },
        ...(flowData.userId ? [{ label: "Dashboard", onClick: () => router.push("/dashboard") }] : []),
        { label: "Templates", onClick: () => router.push("/templates") },
        { label: "Details", onClick: () => router.push("/create") },
        { label: "Payment" },
      ]}
    />
  );
}
