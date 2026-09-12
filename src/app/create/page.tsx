"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DetailsPage } from "@/components/flow/details-page";
import { useFlowStore } from "@/lib/store";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CreateRoute() {
  const router = useRouter();
  const { flowData, setFlowData } = useFlowStore();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAgency, setIsAgency] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const editId = searchParams.get("edit");
    const isAgencyParam = searchParams.get("agency") === "true";

    if (isAgencyParam) {
      setIsAgency(true);
    } else {
      fetch("/api/agency/status")
        .then((r) => r.json())
        .then((data) => {
          if (data?.isAgency && data?.status === "approved") {
            setIsAgency(true);
          }
        })
        .catch(() => {});
    }

    if (editId) {
      fetch(`/api/invitations/${editId}`)
        .then((r) => r.json())
        .then(({ invitation }) => {
          if (invitation) {
            // Concluded Event Locking Rule: If invitation is LIVE and all events have passed, lock edits completely
            const rawEvents = (invitation.events as { name: string; date: string; time: string; venue?: string; order_index: number }[]) || [];
            const isPassed = Boolean(invitation.is_active) && rawEvents.length > 0 && rawEvents.every((e) => {
              if (!e.date) return false;
              const evDate = new Date(e.date);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              return evDate < today;
            });

            if (isPassed) {
              toast.error("This event has concluded. Edits are locked to preserve event records.");
              router.push(isAgencyParam ? "/dashboard/agency" : "/dashboard");
              return;
            }

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
              events: rawEvents
                .sort((a, b) => a.order_index - b.order_index)
                .map((e) => ({ name: e.name, date: e.date, time: e.time, venue: e.venue })),
              selectedPlan: invitation.plan,
              category: (invitation as any).category || undefined,
              paymentDone: invitation.is_active ?? false,
              slug: invitation.slug ?? "",
              showBismillah: invitation.show_bismillah ?? (!['birthday', 'school', 'meeting', 'corporate'].includes(((invitation as any).category || '').toLowerCase())),
              showQuranVerse: invitation.show_quran_verse ?? (!['birthday', 'school', 'meeting', 'corporate'].includes(((invitation as any).category || '').toLowerCase())),
              customVerseText: invitation.custom_verse_text ?? "",
              customVerseSource: invitation.custom_verse_source ?? "",
              primaryHostFamily: invitation.host_bride_family ?? "",
              secondaryHostFamily: invitation.host_groom_family ?? "",
              primaryHostCity: invitation.host_bride_city ?? "",
              secondaryHostCity: invitation.host_groom_city ?? "",
              contactPhone: invitation.contact_phone ?? "",
              isSegregated: Boolean((invitation as any).is_segregated),
              venueDetailsSegregated: invitation.venue_details_segregated ?? "",
              showNikahRegistration: Boolean((invitation as any).show_nikah_registration),
              youtubeVideoId: invitation.youtube_video_id ?? "",
              customMusicUrl: invitation.custom_music_url ?? "",
              customMusicName: invitation.custom_music_name ?? "",
              voiceNoteUrl: invitation.voice_note_url ?? "",
              voiceNoteTitle: invitation.voice_note_title ?? "",
              voiceNoteSender: invitation.voice_note_sender ?? "",
              agencyName: invitation.agency_name ?? "",
              agencyPhone: invitation.agency_phone ?? "",
              whiteLabelFooter: invitation.white_label_footer ?? "",
              clientApprovalStatus: invitation.client_approval_status || "pending",
              clientApprovalNotes: invitation.client_approval_notes ?? "",
              clientApprovedAt: invitation.client_approved_at ?? "",
              heroImage: invitation.hero_image_url ?? "",
              slideshowImages: invitation.slideshow_image_urls ?? [],
              gifts: invitation.gifts ?? "",
              dressCodeWomen: invitation.dress_code_women ?? "",
              dressCodeMen: invitation.dress_code_men ?? "",
              transportation: invitation.transportation ?? "",
              accommodation: invitation.accommodation ?? "",
              hideDigitalShagun: Boolean((invitation as any).hide_digital_shagun),
              showHeadcount: typeof (invitation as any).show_headcount === "boolean"
                ? Boolean((invitation as any).show_headcount)
                : ((invitation as any).client_approval_notes || "").includes("[HEADCOUNT:enabled=true]"),
              showDietaryPreferences: typeof (invitation as any).show_dietary_preferences === "boolean"
                ? Boolean((invitation as any).show_dietary_preferences)
                : ((invitation as any).client_approval_notes || "").includes("[DIETARY:enabled=true]"),
              showCrowdPhotoWall: typeof (invitation as any).show_crowd_photo_wall === "boolean"
                ? (invitation as any).show_crowd_photo_wall
                : !((invitation as any).client_approval_notes || "").includes("[PHOTO_WALL:enabled=false]"),
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
      // If user came to create an invitation without picking a template, send them to select template first
      if (!flowData.selectedTemplateId) {
        router.replace(isAgencyParam ? "/templates?agency=true" : "/templates");
        return;
      }

      // Starting a new invitation — ensure no old draft ID/payment state leaks and always start from page 1
      setFlowData((prev) => {
        const hasStaleId = Boolean(prev.invitationId || prev.paymentDone);
        if (hasStaleId) {
          return {
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
            currentStep: 1,
            lastSavedStep: 1,
          };
        }
        return {
          currentStep: 1,
          lastSavedStep: 1,
        };
      });
      setMounted(true);
      setIsLoading(false);
    }
  }, [flowData.selectedTemplateId, router, setFlowData]);

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
      onBack={() => {
        if (flowData.paymentDone) {
          router.push(isAgency ? "/dashboard/agency" : "/dashboard");
        } else {
          router.push(isAgency ? "/templates?agency=true" : "/templates");
        }
      }}
      onContinue={() => {
        if (flowData.paymentDone && flowData.invitationId) {
          toast.success("Changes saved successfully to your live invitation!");
          router.push(isAgency ? "/dashboard/agency" : "/dashboard");
        } else {
          router.push(isAgency ? "/payment?agency=true" : "/payment");
        }
      }}
      onRequireLogin={() => router.push(isAgency ? "/login?next=/create?agency=true" : "/login")}
      crumbs={[
        { label: "Home", href: "/" },
        ...(flowData.userId ? [{ label: isAgency ? "Agency Dashboard" : "Dashboard", href: isAgency ? "/dashboard/agency" : "/dashboard" }] : []),
        ...(flowData.paymentDone ? [] : [{ label: "Templates", href: isAgency ? "/templates?agency=true" : "/templates" }]),
        { label: flowData.paymentDone ? "Edit Invitation" : "Details" },
      ]}
    />
  );
}
