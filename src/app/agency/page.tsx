import type { Metadata } from "next";
import { AgencyPage } from "@/components/landing/agency-page";

export const metadata: Metadata = {
  title: "Agency & Event Planner Partner Program | Smart Invites",
  description: "Wholesale credits, 100% white-label footer branding, and multi-client management for wedding planners and event agencies in Pakistan.",
  keywords: ["event planners Pakistan", "wedding planners digital invitations", "wholesale wedding invitations", "white label invitations"],
  openGraph: {
    title: "Agency & Event Planner Partner Program | Smart Invites",
    description: "Wholesale credits, 100% white-label footer branding, and multi-client management for wedding planners and event agencies in Pakistan.",
    type: "website",
    locale: "en_PK",
    siteName: "Smart Invites",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Smart Invites Agency & Event Planner Program",
      },
    ],
  },
};

export default function AgencyRoutePage() {
  return <AgencyPage />;
}
