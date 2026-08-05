import type { Metadata } from "next";
import AboutClientPage from "./about-client";

export const metadata: Metadata = {
  title: "About Us | ShaadiLink — Premium Digital Invitations",
  description: "Crafting beautiful, interactive digital wedding invitations for Pakistani celebrations. Learn about our story, values, and vision.",
  keywords: ["about ShaadiLink", "digital wedding cards Pakistan", "shaadi card designers"],
  openGraph: {
    title: "About Us | ShaadiLink — Premium Digital Invitations",
    description: "Crafting beautiful, interactive digital wedding invitations for Pakistani celebrations.",
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
    title: "About Us | ShaadiLink — Premium Digital Invitations",
    description: "Crafting beautiful, interactive digital wedding invitations for Pakistani celebrations.",
    images: ["/og-image.png"],
  }
};

export default function AboutRoutePage() {
  return <AboutClientPage />;
}
