import type { Metadata } from "next";
import TermsClientPage from "./terms-client";

export const metadata: Metadata = {
  title: "Terms of Service | Smart Invites — Terms & Conditions",
  description: "Read the Terms of Service for Smart Invites. Learn about your rights and responsibilities when using our digital wedding card platform.",
  keywords: ["terms of service", "terms and conditions", "Smart Invites terms"],
  openGraph: {
    title: "Terms of Service | Smart Invites — Terms & Conditions",
    description: "Read the Terms of Service for Smart Invites. Learn about your rights and responsibilities when using our digital wedding card platform.",
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
    title: "Terms of Service | Smart Invites — Terms & Conditions",
    description: "Read the Terms of Service for Smart Invites. Learn about your rights and responsibilities when using our digital wedding card platform.",
    images: ["/og-image.png"],
  }
};

export default function TermsRoutePage() {
  return <TermsClientPage />;
}
