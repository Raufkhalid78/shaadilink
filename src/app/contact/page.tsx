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
  }
};

export default function ContactRoutePage() {
  return <ContactClientPage />;
}
