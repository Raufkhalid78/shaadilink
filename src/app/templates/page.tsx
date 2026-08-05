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
    title: "Premium Wedding Invitation Templates | ShaadiLink",
    description: "Browse beautiful digital wedding invitation templates for Nikkah, Mehndi, Baraat, and Walima. Explore 3D door reveals, scroll rollups, and interactive RSVP.",
    images: ["/og-image.png"],
  }
};

export default function TemplatesRoutePage() {
  return <TemplatesClientPage />;
}
