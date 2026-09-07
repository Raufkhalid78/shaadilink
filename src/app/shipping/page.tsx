import type { Metadata } from "next";
import ShippingClientPage from "./shipping-client";

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy | Smart Invites — Instant Delivery",
  description: "Read our shipping and delivery policy. Smart Invites invitations are delivered instantly online through our digital sharing links.",
  keywords: ["shipping policy", "instant delivery", "Smart Invites delivery"],
  openGraph: {
    title: "Shipping & Delivery Policy | Smart Invites — Instant Delivery",
    description: "Read our shipping and delivery policy. Smart Invites invitations are delivered instantly online through our digital sharing links.",
    type: "website",
    locale: "en_PK",
    siteName: "Smart Invites",
  }
};

export default function ShippingRoutePage() {
  return <ShippingClientPage />;
}
