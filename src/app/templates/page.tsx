import type { Metadata } from "next";
import TemplatesClientPage from "./templates-client-page";

export const metadata: Metadata = {
  title: "Premium Digital Invitation Templates | Smart Invites",
  description: "Browse 30+ luxury digital invitation templates for Weddings, Birthdays, School Convocations, and Corporate Conferences with 3D door reveals, music, and interactive RSVP.",
  keywords: [
    "digital invitation templates",
    "wedding invitation templates",
    "birthday invitation templates",
    "graduation invitation templates",
    "corporate event invitation templates",
    "Pakistani wedding cards online",
    "digital shaadi card designs",
    "online conference invitation",
  ],
  alternates: {
    canonical: "https://smartinvites.com.pk/templates",
  },
  openGraph: {
    title: "Premium Digital Invitation Templates | Smart Invites",
    description: "Browse 30+ luxury digital invitation templates for Weddings, Birthdays, School Convocations, and Corporate Conferences with 3D door reveals, music, and interactive RSVP.",
    url: "https://smartinvites.com.pk/templates",
    type: "website",
    locale: "en_PK",
    siteName: "Smart Invites",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Smart Invites - Premium Digital Invitation Templates",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Premium Digital Invitation Templates | Smart Invites",
    description: "Browse 30+ luxury digital invitation templates for Weddings, Birthdays, School, and Corporate events with 3D door reveals and RSVP.",
    images: ["/og-image.png"],
  }
};

export default async function TemplatesRoutePage({ searchParams }: { searchParams: Promise<{ category?: string; agency?: string }> }) {
  const { category, agency } = (await searchParams) || {};
  return <TemplatesClientPage initialCategory={category || null} isAgency={agency === "true"} />;
}
