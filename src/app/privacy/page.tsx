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
  }
};

export default function PrivacyRoutePage() {
  return <PrivacyClientPage />;
}
