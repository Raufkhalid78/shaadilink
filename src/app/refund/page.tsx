import type { Metadata } from "next";
import RefundClientPage from "./refund-client";

export const metadata: Metadata = {
  title: "Refund Policy | ShaadiLink — 24-Hour Guarantee",
  description: "Read our refund policy. ShaadiLink offers a hassle-free 24-hour money-back guarantee for all digital wedding invitation purchases.",
  keywords: ["refund policy", "money back guarantee", "ShaadiLink refund"],
  openGraph: {
    title: "Refund Policy | ShaadiLink — 24-Hour Guarantee",
    description: "Read our refund policy. ShaadiLink offers a hassle-free 24-hour money-back guarantee for all digital wedding invitation purchases.",
    type: "website",
    locale: "en_PK",
    siteName: "ShaadiLink",
  }
};

export default function RefundRoutePage() {
  return <RefundClientPage />;
}
