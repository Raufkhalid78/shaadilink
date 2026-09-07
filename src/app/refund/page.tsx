import type { Metadata } from "next";
import RefundClientPage from "./refund-client";

export const metadata: Metadata = {
  title: "Refund Policy | Smart Invites",
  description: "Read our refund policy. Smart Invites's guidelines on digital purchases, duplicate payments, and technical support.",
  keywords: ["refund policy", "Smart Invites refund", "payment policy"],
  openGraph: {
    title: "Refund Policy | Smart Invites",
    description: "Read our refund policy. Smart Invites's guidelines on digital purchases, duplicate payments, and technical support.",
    type: "website",
    locale: "en_PK",
    siteName: "Smart Invites",
  }
};

export default function RefundRoutePage() {
  return <RefundClientPage />;
}
