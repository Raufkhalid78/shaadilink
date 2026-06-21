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
  }
};

export default function AboutRoutePage() {
  return <AboutClientPage />;
}
