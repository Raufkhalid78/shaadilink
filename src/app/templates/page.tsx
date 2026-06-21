import type { Metadata } from "next";
import TemplatesClientPage from "./templates-client-page";

export const metadata: Metadata = {
  title: "Premium Wedding Invitation Templates | ShaadiLink",
  description: "Browse beautiful digital wedding invitation templates for Nikkah, Mehndi, Baraat, and Walima. Explore 3D door reveals, scroll rollups, and interactive RSVP.",
  keywords: [
    "wedding invitation templates",
    "Pakistani wedding cards online",
    "mehndi invitation card templates",
    "nikkah invitation templates",
    "baraat invitation templates",
    "digital shaadi card designs"
  ],
  openGraph: {
    title: "Premium Wedding Invitation Templates | ShaadiLink",
    description: "Browse beautiful digital wedding invitation templates for Nikkah, Mehndi, Baraat, and Walima. Explore 3D door reveals, scroll rollups, and interactive RSVP.",
    type: "website",
    locale: "en_PK",
    siteName: "ShaadiLink",
  }
};

export default function TemplatesRoutePage() {
  return <TemplatesClientPage />;
}
