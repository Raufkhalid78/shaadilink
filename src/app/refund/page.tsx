import type { Metadata } from "next";
import RefundClientPage from "./refund-client";

export const metadata: Metadata = {
  title: "Refund Policy | ShaadiLink",
  description: "Read our refund policy. ShaadiLink's guidelines on digital purchases, duplicate payments, and technical support.",
  keywords: ["refund policy", "ShaadiLink refund", "payment policy"],
  openGraph: {
    title: "Refund Policy | ShaadiLink",
    description: "Read our refund policy. ShaadiLink's guidelines on digital purchases, duplicate payments, and technical support.",
    type: "website",
    locale: "en_PK",
    siteName: "ShaadiLink",
  }
};

export default function RefundRoutePage() {
  return <RefundClientPage />;
}
