import type { Metadata } from "next";
import PrivacyClientPage from "./privacy-client";

export const metadata: Metadata = {
  title: "Privacy Policy | Smart Invites — Secure Digital Invitations",
  description: "Read our privacy policy to understand how Smart Invites handles and protects guest RSVPs, user accounts, and invitation details.",
  keywords: ["privacy policy", "data safety", "Smart Invites security"],
  openGraph: {
    title: "Privacy Policy | Smart Invites — Secure Digital Invitations",
    description: "Read our privacy policy to understand how Smart Invites handles and protects guest RSVPs, user accounts, and invitation details.",
    type: "website",
    locale: "en_PK",
    siteName: "Smart Invites",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Smart Invites - Premium Digital Wedding Invitations",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | Smart Invites — Secure Digital Invitations",
    description: "Read our privacy policy to understand how Smart Invites handles and protects guest RSVPs, user accounts, and invitation details.",
    images: ["/og-image.png"],
  }
};

export default function PrivacyRoutePage() {
  return <PrivacyClientPage />;
}
