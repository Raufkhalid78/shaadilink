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
  }
};

export default function TermsRoutePage() {
  return <TermsClientPage />;
}
