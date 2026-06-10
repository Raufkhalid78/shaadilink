import type { Metadata, Viewport } from "next";
import { Playfair_Display, Amiri, Inter, Cinzel_Decorative, Pinyon_Script } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const cinzelDec = Cinzel_Decorative({
  variable: "--font-cinzel-dec",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const pinyon = Pinyon_Script({
  variable: "--font-pinyon",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0f1a16",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  title: "ShaadiLink — Premium Digital Wedding Invitations for Pakistani Weddings",
  description:
    "Create stunning digital wedding invitations with premium animations, 3D door reveals, scratch card date reveals, and interactive RSVP. For Mehndi, Baraat, Walima and more — celebrate every moment in cinematic style.",
  keywords: [
    "ShaadiLink",
    "digital wedding invitation",
    "Pakistani wedding card",
    "online wedding invitation",
    "Mehndi invitation",
    "Baraat invitation",
    "Walima invitation",
    "digital shaadi card",
    "wedding invitation online Pakistan",
    "premium wedding invitation",
  ],
  openGraph: {
    title: "ShaadiLink — Premium Digital Wedding Invitations",
    description:
      "Cinematic digital wedding invitations with 3D animations, scratch card reveals, live countdowns, and RSVP. Made for Pakistani weddings.",
    type: "website",
    locale: "en_PK",
    siteName: "ShaadiLink",
  },
  twitter: {
    card: "summary_large_image",
    title: "ShaadiLink — Premium Digital Wedding Invitations",
    description: "Cinematic digital invitations for Pakistani weddings. Starting Rs. 2,499.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const schemaJson = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": "https://shaadilink.com.pk/#software",
        "name": "ShaadiLink",
        "url": "https://shaadilink.com.pk",
        "applicationCategory": "DesignApplication",
        "operatingSystem": "All",
        "offers": {
          "@type": "AggregateOffer",
          "priceCurrency": "PKR",
          "lowPrice": "2499",
          "highPrice": "3999",
          "offerCount": "2",
          "offers": [
            {
              "@type": "Offer",
              "name": "Classic Plan",
              "price": "2499",
              "priceCurrency": "PKR"
            },
            {
              "@type": "Offer",
              "name": "Royal Plan",
              "price": "3999",
              "priceCurrency": "PKR"
            }
          ]
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "ratingCount": "142",
          "bestRating": "5",
          "worstRating": "1"
        }
      },
      {
        "@type": "FAQPage",
        "@id": "https://shaadilink.com.pk/#faq",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is ShaadiLink?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "ShaadiLink is Pakistan's premium digital wedding invitation platform, allowing you to create beautiful online cards with 3D animations, realistic door reveals, scratch-to-reveal dates, music, photo galleries, and guest RSVPs."
            }
          },
          {
            "@type": "Question",
            "name": "How much does a digital wedding card cost in Pakistan?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "ShaadiLink offers two plans: the Classic Plan for Rs. 2,499 (featuring 8 elegant templates and core features) and the Royal Plan for Rs. 3,999 (unlocking 18 premium templates, 3D door reveals, scratch cards, travel details, and digital shagun)."
            }
          },
          {
            "@type": "Question",
            "name": "Can I edit the invitation card after publishing?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, both plans allow you to make unlimited edits to event dates, timings, venues, and photos right up until your wedding day from your ShaadiLink dashboard."
            }
          }
        ]
      }
    ]
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${playfair.variable} ${amiri.variable} ${inter.variable} ${cinzelDec.variable} ${pinyon.variable} antialiased bg-background text-foreground`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
        />
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "oklch(0.16 0.03 155)",
              border: "1px solid oklch(0.22 0.025 155)",
              color: "oklch(0.92 0.01 80)",
            },
          }}
        />
      </body>
    </html>
  );
}
