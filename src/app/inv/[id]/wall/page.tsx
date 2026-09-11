import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createServiceClient } from "@/lib/supabase/server";
import { BanquetWallClient } from "./banquet-wall-client";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const cleanId = id.replace(/%20| /g, "-");
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);
  const service = createServiceClient();

  const { data: inv } = await (isUuid
    ? service.from("invitations").select("partner1_name, partner2_name, title").eq("id", cleanId)
    : service.from("invitations").select("partner1_name, partner2_name, title").eq("slug", cleanId)
  ).single();

  const title = inv
    ? `${inv.partner1_name && inv.partner2_name ? `${inv.partner1_name} & ${inv.partner2_name}` : inv.title || "Wedding"} — Live Crowd Wall | Smart Invites`
    : "Live Banquet Wall | Smart Invites";

  return {
    title,
    description: "Live banquet hall projector slideshow of crowd photos and guest memories.",
    robots: { index: false, follow: false },
  };
}

export default async function BanquetWallPage({ params }: Props) {
  const { id } = await params;
  const cleanId = id.replace(/%20| /g, "-");
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);
  const service = createServiceClient();

  const { data: inv } = await (isUuid
    ? service.from("invitations").select("id, slug, partner1_name, partner2_name, title, venue, hero_image_url").eq("id", cleanId)
    : service.from("invitations").select("id, slug, partner1_name, partner2_name, title, venue, hero_image_url").eq("slug", cleanId)
  ).single();

  if (!inv) {
    notFound();
  }

  return (
    <BanquetWallClient
      invitationId={inv.id}
      slug={inv.slug || undefined}
      title={inv.title || ""}
      partner1Name={inv.partner1_name || ""}
      partner2Name={inv.partner2_name || ""}
      venue={inv.venue || ""}
      heroImageUrl={inv.hero_image_url || ""}
    />
  );
}
