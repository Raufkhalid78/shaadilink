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
  const supabase = await createClient();

  const { data } = await supabase
    .from("invitations")
    .select("partner1_name, partner2_name, venue, hero_image_url")
    .eq("id", cleanId)
    .single();

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

export default async function InvitationPage({ params }: Props) {
  const { id } = await params;
  const cleanId = id.replace(/%20| /g, "-");
  const supabase = await createClient();

  const { data: invitation, error } = await supabase
    .from("invitations")
    .select(`
      *,
      events (
        id, name, date, time, venue, order_index
      )
    `)
    .eq("id", cleanId)
    .single();

  if (error || !invitation) {
    notFound();
  }

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
    events: ((invitation.events as { id: string; name: string; date: string; time: string; venue?: string; order_index: number }[]) || [])
      .sort((a, b) => a.order_index - b.order_index)
      .map((e) => ({ name: e.name, date: e.date, time: e.time, venue: e.venue })),
    userId: invitation.user_id,
    email: "",
    fullName: "",
    showBismillah: (invitation as { show_bismillah?: boolean }).show_bismillah ?? true,
    paymentDone: true,
  };

  return <InvitationViewerWrapper templateId={invitation.template_id} flowData={flowData} />;
}
