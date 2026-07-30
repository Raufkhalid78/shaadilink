import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import InvitationViewerWrapper from "./invitation-viewer-wrapper";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const cleanId = id.replace(/%20| /g, "-");
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);
  const supabase = await createClient();

  const { data } = await (isUuid
    ? supabase.from("invitations").select("partner1_name, partner2_name, venue, hero_image_url").eq("id", cleanId)
    : supabase.from("invitations").select("partner1_name, partner2_name, venue, hero_image_url").eq("slug", cleanId)
  ).single();

  if (!data) {
    return { title: "Wedding Invitation | ShaadiLink" };
  }

  const names = `${data.partner1_name} & ${data.partner2_name}`;
  return {
    title: `${names} — Wedding Invitation | ShaadiLink`,
    description: `You are invited to the wedding of ${names} at ${data.venue}. View the beautiful digital invitation on ShaadiLink.`,
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      title: `${names} — Wedding Invitation`,
      description: `You are invited to the wedding celebration of ${names}.`,
      images: data.hero_image_url ? [{ url: data.hero_image_url }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${names} — Wedding Invitation`,
    },
  };
}

export default async function InvitationPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ guest?: string; events?: string; seats?: string }> }) {
  const { id } = await params;
  const { guest, events, seats } = await searchParams;
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

  const { data: invitation, error } = await (isUuid
    ? query.eq("id", cleanId)
    : query.eq("slug", cleanId)
  ).single();

  if (error || !invitation) {
    notFound();
  }

  const rawGuestName = guest ? guest.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : null;
  const guestName = (invitation as any).personalized_guest_links ? rawGuestName : rawGuestName;
  // Parse allowed events and seat count from URL
  const guestAllowedEvents = events ? events.split(',').filter(Boolean) : null;
  // seats=0 means "Whole Family" (no specific count limit), seats=N means N seats, missing means no badge
  const guestSeats = seats !== undefined && seats !== null ? (parseInt(seats) >= 0 ? parseInt(seats) : null) : null;

  // Build flowData from DB record
  const flowData = {
    invitationId: invitation.id,
    selectedTemplateId: invitation.template_id,
    selectedPlan: invitation.plan,
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
    hostBrideFamily: (invitation as { host_bride_family?: string }).host_bride_family ?? "",
    hostGroomFamily: (invitation as { host_groom_family?: string }).host_groom_family ?? "",
    hostBrideCity: (invitation as { host_bride_city?: string }).host_bride_city ?? "",
    hostGroomCity: (invitation as { host_groom_city?: string }).host_groom_city ?? "",
    contactPhone: (invitation as { contact_phone?: string }).contact_phone ?? "",
    isSegregated: (invitation as { is_segregated?: boolean }).is_segregated ?? false,
    venueDetailsSegregated: (invitation as { venue_details_segregated?: string }).venue_details_segregated ?? "",
    showNikahRegistration: (invitation as { show_nikah_registration?: boolean }).show_nikah_registration ?? false,
    paymentDone: true,
    guestLinksQuota: (invitation as { guest_links_quota?: number }).guest_links_quota ?? 0,
    slug: invitation.slug ?? "",
    guestAllowedEvents: guestAllowedEvents,
    guestSeats: guestSeats,
  };

  return <InvitationViewerWrapper templateId={invitation.template_id} flowData={flowData} guestName={guestName} guestSlug={guest || null} />;
}
