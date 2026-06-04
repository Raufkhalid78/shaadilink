import type { Metadata } from "next";
import { Playfair_Display, Amiri, Inter } from "next/font/google";
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

export const metadata: Metadata = {
  title: "ShaadiLink — Premium Digital Wedding Invitations",
  description:
    "Create stunning digital wedding invitations with premium animations, Pakistani cultural themes, and interactive features. Mehndi, Baraat, Walima — celebrate every moment.",
  keywords: [
    "ShaadiLink",
    "digital wedding invitation",
    "Pakistani wedding",
    "Mehndi",
    "Baraat",
    "Walima",
    "wedding card online",
    "shaadi invitation",
  ],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${playfair.variable} ${amiri.variable} ${inter.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
