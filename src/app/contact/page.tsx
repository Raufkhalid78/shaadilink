import type { Metadata } from "next";
import ContactClientPage from "./contact-client";

export const metadata: Metadata = {
  title: "Contact Us | ShaadiLink — 24/7 Premium Support",
  description: "Have questions about creating your digital wedding card? Contact ShaadiLink support via WhatsApp, email, or our online form.",
  keywords: ["contact ShaadiLink", "wedding card help", "digital card support Pakistan"],
  openGraph: {
    title: "Contact Us | ShaadiLink — 24/7 Premium Support",
    description: "Have questions about creating your digital wedding card? Contact ShaadiLink support.",
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
    title: "Contact Us | ShaadiLink — 24/7 Premium Support",
    description: "Have questions about creating your digital wedding card? Contact ShaadiLink support.",
    images: ["/og-image.png"],
  }
};

export default function ContactRoutePage() {
  const schemaJson = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://shaadilink.com.pk/contact#business",
    "name": "ShaadiLink",
    "url": "https://shaadilink.com.pk",
    "logo": "https://shaadilink.com.pk/logo.svg",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+923363387820",
      "contactType": "customer service",
      "email": "rauf.khaled78@gmail.com",
      "availableLanguage": ["English", "Urdu"]
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
      />
      <ContactClientPage />
    </>
  );
}
