import type { Metadata } from "next";
import AffiliateClientPage from "./affiliate-client";

export const metadata: Metadata = {
  title: "Affiliate & Partner Program | ShaadiLink",
  description: "Join the ShaadiLink affiliate network. Recommend Pakistan's premier digital wedding invitation platform to couples and earn rewards for every referral.",
  keywords: ["affiliate program", "make money online wedding", "wedding invitation referral Pakistan"],
  openGraph: {
    title: "Affiliate & Partner Program | ShaadiLink",
    description: "Join the ShaadiLink affiliate network. Recommend Pakistan's premier digital wedding invitation platform to couples and earn rewards.",
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
    title: "Affiliate & Partner Program | ShaadiLink",
    description: "Join the ShaadiLink affiliate network. Recommend Pakistan's premier digital wedding invitation platform to couples and earn rewards.",
    images: ["/og-image.png"],
  }
};

export default function AffiliateRoutePage() {
  return <AffiliateClientPage />;
}
