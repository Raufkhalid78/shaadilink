import type { Metadata } from "next";
import TermsClientPage from "./terms-client";

export const metadata: Metadata = {
  title: "Terms of Service | ShaadiLink — Terms & Conditions",
  description: "Read the Terms of Service for ShaadiLink. Learn about your rights and responsibilities when using our digital wedding card platform.",
  keywords: ["terms of service", "terms and conditions", "ShaadiLink terms"],
  openGraph: {
    title: "Terms of Service | ShaadiLink — Terms & Conditions",
    description: "Read the Terms of Service for ShaadiLink. Learn about your rights and responsibilities when using our digital wedding card platform.",
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
    title: "Terms of Service | ShaadiLink — Terms & Conditions",
    description: "Read the Terms of Service for ShaadiLink. Learn about your rights and responsibilities when using our digital wedding card platform.",
    images: ["/og-image.png"],
  }
};

export default function TermsRoutePage() {
  return <TermsClientPage />;
}
