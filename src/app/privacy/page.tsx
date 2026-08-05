import type { Metadata } from "next";
import PrivacyClientPage from "./privacy-client";

export const metadata: Metadata = {
  title: "Privacy Policy | ShaadiLink — Secure Digital Invitations",
  description: "Read our privacy policy to understand how ShaadiLink handles and protects guest RSVPs, user accounts, and invitation details.",
  keywords: ["privacy policy", "data safety", "ShaadiLink security"],
  openGraph: {
    title: "Privacy Policy | ShaadiLink — Secure Digital Invitations",
    description: "Read our privacy policy to understand how ShaadiLink handles and protects guest RSVPs, user accounts, and invitation details.",
    type: "website",
    locale: "en_PK",
    siteName: "ShaadiLink",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ShaadiLink - Premium Digital Wedding Invitations",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | ShaadiLink — Secure Digital Invitations",
    description: "Read our privacy policy to understand how ShaadiLink handles and protects guest RSVPs, user accounts, and invitation details.",
    images: ["/og-image.png"],
  }
};

export default function PrivacyRoutePage() {
  return <PrivacyClientPage />;
}
