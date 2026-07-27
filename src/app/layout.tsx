import type { Metadata, Viewport } from "next";
import { Playfair_Display, Amiri, Inter, Cinzel_Decorative, Great_Vibes } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AIChatFAB } from "@/components/ai-chat-fab";
import { LanguageProvider } from "@/components/language-provider";
import { FramerMotionProvider } from "@/components/framer-provider";

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

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0f1a16",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://shaadilink.com.pk"),
  applicationName: "ShaadiLink",
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
    title: "ShaadiLink — Premium Digital Wedding Invitations",
    description: "Cinematic digital invitations for Pakistani weddings. Starting Rs. 3,499.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/logo.svg",
    apple: "/logo-180.png",
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
          "lowPrice": "3499",
          "highPrice": "5799",
          "offerCount": "2",
          "offers": [
            {
              "@type": "Offer",
              "name": "Classic Plan",
              "price": "3499",
              "priceCurrency": "PKR"
            },
            {
              "@type": "Offer",
              "name": "Royal Plan",
              "price": "5799",
              "priceCurrency": "PKR"
            }
          ]
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
              "text": "ShaadiLink offers two plans: the Classic Plan for Rs. 3,499 (featuring 8 elegant templates and core features) and the Royal Plan for Rs. 5,799 (unlocking 18 premium templates, 3D door reveals, scratch cards, travel details, and digital shagun)."
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
        className={`${playfair.variable} ${amiri.variable} ${inter.variable} ${cinzelDec.variable} ${greatVibes.variable} antialiased bg-background text-foreground`}
      >
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:p-4 focus:bg-background focus:text-foreground focus:rounded-md focus:shadow-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          Skip to main content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
        />
        <LanguageProvider>
          <FramerMotionProvider>
            <AIChatFAB />
            <div id="main-content">
              {children}
            </div>
          </FramerMotionProvider>
          <Toaster 
            position="bottom-center"
            toastOptions={{
              className: 'font-inter text-sm',
              style: {
                background: 'var(--background)',
                color: 'var(--foreground)',
                border: '1px solid hsl(var(--gold)/0.2)',
              }
            }}
          />
        </LanguageProvider>
      </body>
    </html>
  );
}
