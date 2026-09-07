import type { Metadata, Viewport } from "next";
import { Playfair_Display, Amiri, Inter, Cinzel_Decorative, Great_Vibes } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AIChatFABWrapper } from "@/components/ai-chat-fab-wrapper";
import { LanguageProvider } from "@/components/language-provider";
import { CookieBanner } from "@/components/cookie-banner";
import { FramerMotionProvider } from "@/components/framer-provider";
import { SentryInit } from "@/components/sentry-init";

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
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://smartinvites.com.pk"),
  applicationName: "Smart Invites",
  title: "Smart Invites — Premium Digital Invitations for Every Event",
  description:
    "Create stunning digital invitations for Weddings, Birthdays, School Events, and Meetings. Premium animations, RSVP tracking, and elegant templates for every occasion.",
  keywords: [
    "Smart Invites",
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
    url: "https://www.smartinvites.com.pk/",
    title: "Smart Invites — Premium Digital Wedding Invitations",
    description:
      "Cinematic digital wedding invitations with 3D animations, scratch card reveals, live countdowns, and RSVP. Made for Pakistani weddings.",
    type: "website",
    locale: "en_PK",
    siteName: "Smart Invites",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Smart Invites - Premium Digital Wedding Invitations",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Smart Invites — Premium Digital Wedding Invitations",
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
        "@id": "https://smartinvites.com.pk/#software",
        "name": "Smart Invites",
        "url": "https://smartinvites.com.pk",
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
        "@id": "https://smartinvites.com.pk/#faq",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is Smart Invites?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Smart Invites is Pakistan's premium digital wedding invitation platform, allowing you to create beautiful online cards with 3D animations, realistic door reveals, scratch-to-reveal dates, music, photo galleries, and guest RSVPs."
            }
          },
          {
            "@type": "Question",
            "name": "How much does a digital wedding card cost in Pakistan?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Smart Invites offers two plans: the Classic Plan for Rs. 3,499 (featuring 8 elegant templates and core features) and the Royal Plan for Rs. 5,799 (unlocking 18 premium templates, 3D door reveals, scratch cards, travel details, and digital shagun)."
            }
          },
          {
            "@type": "Question",
            "name": "Can I edit the invitation card after publishing?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, both plans allow you to make unlimited edits to event dates, timings, venues, and photos right up until your wedding day from your Smart Invites dashboard."
            }
          }
        ]
      },
      {
        "@type": "Organization",
        "@id": "https://smartinvites.com.pk/#organization",
        "name": "Smart Invites",
        "url": "https://smartinvites.com.pk",
        "logo": "https://smartinvites.com.pk/logo.svg",
        "sameAs": [
          "https://www.instagram.com/smartinvites.pk",
          "https://www.facebook.com/smartinvites"
        ]
      },
      {
        "@type": "WebSite",
        "@id": "https://smartinvites.com.pk/#website",
        "url": "https://smartinvites.com.pk",
        "name": "Smart Invites",
        "publisher": {
          "@id": "https://smartinvites.com.pk/#organization"
        }
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
          className="absolute -translate-y-[200%] focus:translate-y-4 focus:absolute top-0 left-4 z-50 p-4 bg-background text-foreground rounded-md shadow-md outline-none ring-2 ring-primary transition-transform duration-200"
        >
          Skip to main content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
        />
        <LanguageProvider>
          <SentryInit />
          <FramerMotionProvider>
            <AIChatFABWrapper />
            {children}
          </FramerMotionProvider>
          <CookieBanner />
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
