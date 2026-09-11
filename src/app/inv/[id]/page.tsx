import { createClient, createServiceClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import Link from "next/link";
import { Lock, ShieldAlert } from "lucide-react";
import InvitationViewerWrapper from "./invitation-viewer-wrapper";
import { getCategoryForTemplate } from "@/lib/category-utils";
import { verifyAndConsumeReviewView } from "@/lib/review-token";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ guest?: string; events?: string; seats?: string; review?: string; token?: string }>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { id } = await params;
  const { guest } = (await searchParams) || {};
  const cleanId = id.replace(/%20| /g, "-");
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);
  const supabase = await createClient();

  const { data } = await (isUuid
    ? supabase.from("invitations").select("partner1_name, partner2_name, venue, hero_image_url, template_id, category").eq("id", cleanId)
    : supabase.from("invitations").select("partner1_name, partner2_name, venue, hero_image_url, template_id, category").eq("slug", cleanId)
  ).single();

  if (!data) {
    return { title: "Invitation | Smart Invites" };
  }

  const category = getCategoryForTemplate(data.template_id, (data as { category?: string }).category);

  let eventTitle = `${data.partner1_name || 'Wedding'} & ${data.partner2_name || 'Invitation'} — Wedding Invitation`;
  let eventDesc = `You are invited to the celebration of ${data.partner1_name || 'the couple'}${data.partner2_name ? ` & ${data.partner2_name}` : ''}${data.venue ? ` at ${data.venue}` : ''}. View the digital invitation on Smart Invites.`;

  if (category === 'birthday') {
    eventTitle = `${data.partner1_name || 'Birthday Celebrant'}'s Birthday Celebration | Smart Invites`;
    eventDesc = `You are warmly invited to celebrate ${data.partner1_name || 'our celebrant'}'s birthday${data.venue ? ` at ${data.venue}` : ''}.`;
  } else if (category === 'school') {
    eventTitle = `${data.partner1_name || 'Class of 2027'} Commencement Ceremony | Smart Invites`;
    eventDesc = `You are invited to attend the commencement proceedings for ${data.partner1_name || 'the graduates'}${data.venue ? ` at ${data.venue}` : ''}.`;
  } else if (category === 'corporate') {
    eventTitle = `${data.partner1_name || 'Executive'}: ${data.partner2_name || 'Summit & Keynote'} | Smart Invites`;
    eventDesc = `Executive invitation to ${data.partner2_name || 'the summit'} hosted by ${data.partner1_name || 'the organization'}${data.venue ? ` at ${data.venue}` : ''}.`;
  }

  const guestQuery = guest ? `&guest=${encodeURIComponent(guest)}` : '';
  const ogImageUrl = `/api/og/invitation?id=${encodeURIComponent(cleanId)}${guestQuery}`;

  return {
    title: eventTitle,
    description: eventDesc,
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      title: eventTitle,
      description: eventDesc,
      url: `https://www.smartinvites.com.pk/inv/${cleanId}`,
      siteName: 'Smart Invites',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: eventTitle,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: eventTitle,
      description: eventDesc,
      images: [ogImageUrl],
    },
  };
}

export default async function InvitationPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { guest, events, seats, review, token } = await searchParams;
  const cleanId = id.replace(/%20| /g, "-");
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);
  const supabase = await createClient();

  const query = supabase
    .from("invitations")
    .select(`
      *,
      events (
        id, name, date, time, venue, order_index
      )
    `);

  const { data: publicInv } = await (isUuid
    ? query.eq("id", cleanId)
    : query.eq("slug", cleanId)
  ).single();

  let invitation = publicInv;
  let isReviewMode = false;
  let reviewViewsCount: number | undefined = undefined;
  let reviewMaxViews: number | undefined = undefined;

  if (!invitation) {
    // Check if it's an unpublished draft or owned by the logged-in user
    const service = createServiceClient();
    const { data: draftInv } = await (isUuid
      ? service.from("invitations").select("*, events(id, name, date, time, venue, order_index)").eq("id", cleanId)
      : service.from("invitations").select("*, events(id, name, date, time, venue, order_index)").eq("slug", cleanId)
    ).single();

    if (draftInv && !draftInv.is_active) {
      const { data: { user } } = await supabase.auth.getUser();
      const isOwner = !!(user && user.id === draftInv.user_id);
      let isAdmin = false;
      if (user && !isOwner) {
        const { data: profile } = await service.from("profiles").select("role").eq("id", user.id).single();
        if (profile?.role === "admin") isAdmin = true;
      }

      if (isOwner || isAdmin) {
        // Owner or Admin previewing their draft
        invitation = draftInv;
        isReviewMode = review === "true" || review === "1" || !!token;
      } else if (token) {
        // Client reviewing via secure short token (7-9 characters) with 7-view limit
        const cookieStore = await cookies();
        const sessionVal = cookieStore.get(`smartinvites_review_sess_${draftInv.id}`)?.value;
        const isSameSession = sessionVal === token.trim();

        const reviewResult = await verifyAndConsumeReviewView(draftInv.id, token.trim(), isSameSession);

        if (!reviewResult.valid) {
          // Token is invalid/mistyped
          return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
              <div className="max-w-md w-full p-8 rounded-3xl border border-white/10 bg-card/60 backdrop-blur-xl space-y-6 shadow-2xl">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center mx-auto text-amber-400">
                  <Lock className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">Invalid Review Link</h1>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    This review link is invalid or has been revoked. Please check the URL or request a fresh link from your event planner.
                  </p>
                </div>
                <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/login" className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-medium text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md">
                    Sign in as Host
                  </Link>
                  <Link href="/templates" className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-medium text-sm border border-white/10 hover:bg-white/5 transition-all text-muted-foreground hover:text-foreground">
                    Browse Templates
                  </Link>
                </div>
              </div>
            </div>
          );
        }

        if (reviewResult.isExpired) {
          // View limit reached (e.g. 7/7 views consumed)
          const agencyOrContactPhone = draftInv.agency_phone || draftInv.contact_phone;
          const cleanPhone = agencyOrContactPhone ? agencyOrContactPhone.replace(/[^0-9]/g, "") : "";
          const waPhone = cleanPhone.startsWith("0") ? "92" + cleanPhone.slice(1) : cleanPhone;
          const waMsg = encodeURIComponent(
            `Salam! Our invitation review link for ${draftInv.partner1_name || "our event"} has reached the ${reviewResult.maxViews}/${reviewResult.maxViews} view limit. Could you please generate a fresh review link for us? Thank you!`
          );

          return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
              <div className="max-w-md w-full p-8 rounded-3xl border border-rose-500/30 bg-card/70 backdrop-blur-xl space-y-6 shadow-2xl">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                    Limit Reached: {reviewResult.viewsCount}/{reviewResult.maxViews} Views
                  </span>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground pt-1">Review Link Expired</h1>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    This confidential draft preview has reached its maximum view limit ({reviewResult.viewsCount} of {reviewResult.maxViews} allowed views).
                    To protect event privacy and security, access has been temporarily locked.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-background/50 border border-white/10 text-xs text-muted-foreground text-left space-y-1.5">
                  <p className="font-semibold text-foreground">Need continued access?</p>
                  <p>Please contact your event planner or host to generate a fresh review link with renewed view sessions.</p>
                </div>
                <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                  {waPhone ? (
                    <a
                      href={`https://wa.me/${waPhone}?text=${waMsg}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-medium text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md gap-2"
                    >
                      <span>Contact Planner via WhatsApp</span>
                    </a>
                  ) : null}
                  <Link href="/login" className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-medium text-sm border border-white/10 hover:bg-white/5 transition-all text-muted-foreground hover:text-foreground">
                    Sign in as Host
                  </Link>
                </div>
              </div>
            </div>
          );
        }

        // Valid and under limit!
        invitation = draftInv;
        isReviewMode = true;
        reviewViewsCount = reviewResult.viewsCount;
        reviewMaxViews = reviewResult.maxViews;
      } else {
        // Visitor viewing an inactive draft without a valid token or ownership
        return (
          <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
            <div className="max-w-md w-full p-8 rounded-3xl border border-white/10 bg-card/60 backdrop-blur-xl space-y-6 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center mx-auto text-amber-400">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Invitation in Private Draft</h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This invitation has not been published yet or is currently in private draft mode.
                </p>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/login" className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-medium text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md">
                  Sign in as Host
                </Link>
                <Link href="/templates" className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-medium text-sm border border-white/10 hover:bg-white/5 transition-all text-muted-foreground hover:text-foreground">
                  Browse Templates
                </Link>
              </div>
            </div>
          </div>
        );
      }
    } else {
      notFound();
    }
  }

  let rawGuestName = null;
  let guestAllowedEvents = null;
  let guestSeats = null;

  if (guest && invitation?.id) {
    const service = createServiceClient();
    const { data: guestLinks } = await service
      .from("guest_links")
      .select("guest_name, allowed_events, seats")
      .eq("invitation_id", invitation.id)
      .eq("guest_slug", guest)
      .limit(1);

    const guestLink = guestLinks?.[0] ?? null;

    if (guestLink) {
      rawGuestName = guestLink.guest_name;
      guestAllowedEvents = guestLink.allowed_events;
      guestSeats = guestLink.seats !== null ? guestLink.seats : null;
    }
  }

  const guestName = rawGuestName;

  // Build flowData from DB record
  const flowData = {
    invitationId: invitation.id,
    selectedTemplateId: invitation.template_id,
    selectedPlan: invitation.plan,
    category: (invitation as { category?: string }).category || undefined,
    partner1Name: invitation.partner1_name ?? "",
    partner2Name: invitation.partner2_name ?? "",
    venue: invitation.venue ?? "",
    venueAddress: invitation.venue_address ?? "",
    welcomeMessage: invitation.welcome_message ?? "",
    backgroundMusic: invitation.background_music ?? "no-music",
    dressCodeWomen: invitation.dress_code_women ?? "",
    dressCodeMen: invitation.dress_code_men ?? "",
    transportation: invitation.transportation ?? "",
    accommodation: invitation.accommodation ?? "",
    gifts: invitation.gifts ?? "",
    heroImage: invitation.hero_image_url ?? "",
    slideshowImages: invitation.slideshow_image_urls ?? [],
    youtubeVideoId: (invitation as { youtube_video_id?: string }).youtube_video_id ?? "",
    events: ((invitation.events as { id: string; name: string; date: string; time: string; venue?: string; order_index: number }[]) || [])
      .sort((a, b) => a.order_index - b.order_index)
      .map((e) => ({ name: e.name, date: e.date, time: e.time, venue: e.venue })),
    userId: invitation.user_id,
    email: "",
    fullName: "",
    showBismillah: (invitation as { show_bismillah?: boolean }).show_bismillah ?? true,
    showQuranVerse: (invitation as { show_quran_verse?: boolean }).show_quran_verse ?? true,
    customVerseText: (invitation as { custom_verse_text?: string }).custom_verse_text ?? "",
    customVerseSource: (invitation as { custom_verse_source?: string }).custom_verse_source ?? "",
    primaryHostFamily: (invitation as { host_bride_family?: string }).host_bride_family ?? "",
    secondaryHostFamily: (invitation as { host_groom_family?: string }).host_groom_family ?? "",
    primaryHostCity: (invitation as { host_bride_city?: string }).host_bride_city ?? "",
    secondaryHostCity: (invitation as { host_groom_city?: string }).host_groom_city ?? "",
    contactPhone: (invitation as { contact_phone?: string }).contact_phone ?? "",
    agencyName: (invitation as { agency_name?: string }).agency_name ?? "",
    whiteLabelFooter: (invitation as { white_label_footer?: string }).white_label_footer ?? "",
    isSegregated: (invitation as { is_segregated?: boolean }).is_segregated ?? false,
    venueDetailsSegregated: (invitation as { venue_details_segregated?: string }).venue_details_segregated ?? "",
    showNikahRegistration: (invitation as { show_nikah_registration?: boolean }).show_nikah_registration ?? false,
    paymentDone: true,
    guestLinksQuota: (invitation as { guest_links_quota?: number }).guest_links_quota ?? 0,
    slug: invitation.slug ?? "",
    guestAllowedEvents: guestAllowedEvents,
    guestSeats: guestSeats,
    voiceNoteUrl: (invitation as { voice_note_url?: string }).voice_note_url ?? "",
    voiceNoteTitle: (invitation as { voice_note_title?: string }).voice_note_title ?? "",
    voiceNoteSender: (invitation as { voice_note_sender?: string }).voice_note_sender ?? "",
    agencyPhone: (invitation as { agency_phone?: string }).agency_phone ?? "",
  };

  return (
    <InvitationViewerWrapper
      templateId={invitation.template_id}
      flowData={flowData}
      guestName={guestName}
      guestSlug={guest || null}
      isReviewMode={isReviewMode}
      viewsCount={reviewViewsCount}
      maxViews={reviewMaxViews}
    />
  );
}
