import type { Metadata } from "next";
import ShippingClientPage from "./shipping-client";

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy | ShaadiLink — Instant Delivery",
  description: "Read our shipping and delivery policy. ShaadiLink invitations are delivered instantly online through our digital sharing links.",
  keywords: ["shipping policy", "instant delivery", "ShaadiLink delivery"],
  openGraph: {
    title: "Shipping & Delivery Policy | ShaadiLink — Instant Delivery",
    description: "Read our shipping and delivery policy. ShaadiLink invitations are delivered instantly online through our digital sharing links.",
    type: "website",
    locale: "en_PK",
    siteName: "ShaadiLink",
  }
};

export default function ShippingRoutePage() {
  return <ShippingClientPage />;
}
