"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Heart, FileText, Shield, RotateCcw, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CONTACT_CONFIG } from "@/lib/config";

type LegalType = "terms" | "privacy" | "refund" | "shipping";

interface LegalPageProps {
  type: LegalType;
  onBack: () => void;
}

const legalData: Record<
  LegalType,
  {
    title: string;
    icon: typeof FileText;
    lastUpdated: string;
    sections: { heading: string; content: string }[];
  }
> = {
  terms: {
    title: "Terms & Conditions",
    icon: FileText,
    lastUpdated: "March 2025",
    sections: [
      {
        heading: "1. Introduction",
        content:
          "Welcome to ShaadiLink. By accessing and using our services, you agree to be bound by these Terms and Conditions. ShaadiLink provides premium digital wedding invitation webpages for Pakistani weddings.",
      },
      {
        heading: "2. Eligibility",
        content:
          "You must be at least 18 years of age to use our services. By using ShaadiLink, you represent and warrant that you are at least 18 years old and have the legal capacity to enter into these terms.",
      },
      {
        heading: "3. Account Registration",
        content:
          "To create an invitation, you must register for an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.",
      },
      {
        heading: "4. Payment Terms",
        content:
          "All prices are listed in Pakistani Rupees (PKR). Payment is one-time with no recurring charges or hidden fees. We accept all major credit/debit cards, JazzCash, EasyPaisa, and bank transfers. All payments are processed securely with SSL encryption.",
      },
      {
        heading: "5. Service Delivery",
        content:
          "Upon successful payment, you will receive immediate access to create your invitation webpage. Your invitation link will be generated instantly and can be shared with unlimited guests.",
      },
      {
        heading: "6. User Responsibilities",
        content:
          "You are responsible for the accuracy of all information provided in your invitation. You agree not to use our service for any unlawful purpose or to distribute content that is offensive, harmful, or violates third-party rights.",
      },
      {
        heading: "7. Intellectual Property",
        content:
          "All templates, designs, and code are the property of ShaadiLink. You may not reproduce, distribute, or create derivative works from our templates without explicit permission.",
      },
      {
        heading: "8. Service Availability",
        content:
          "We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service. Scheduled maintenance will be communicated in advance. Your invitation pages will remain accessible for at least 30 days after your wedding date.",
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    icon: Shield,
    lastUpdated: "March 2025",
    sections: [
      {
        heading: "1. Data We Collect",
        content:
          "We collect information you provide directly: your name, email, wedding details (couple names, venue, events, dates), guest messages, and RSVP responses. We also collect usage data such as page views and device information.",
      },
      {
        heading: "2. How We Use Your Data",
        content:
          "Your data is used to create and deliver your invitation webpage, process payments, provide customer support, and improve our services. We never sell your personal data to third parties.",
      },
      {
        heading: "3. Payment Data",
        content:
          "Payment processing is handled by our secure payment partners. ShaadiLink does not store your full credit card details. All payment data is transmitted via encrypted SSL connections and processed in compliance with PCI-DSS standards.",
      },
      {
        heading: "4. Data Protection",
        content:
          "We implement industry-standard security measures to protect your data, including encryption, secure servers, and access controls. Your invitation page is only accessible via the unique link you share.",
      },
      {
        heading: "5. Cookies",
        content:
          "We use essential cookies to ensure the proper functioning of our website and analytics cookies to understand how visitors interact with our service. You can manage cookie preferences through your browser settings.",
      },
      {
        heading: "6. Data Retention",
        content:
          "Your invitation page will remain publicly accessible until 30 days after your wedding date, after which it will be automatically set to private. Account data is retained as long as your account is active.",
      },
      {
        heading: "7. Your Rights",
        content:
          `You have the right to access, correct, or delete your personal data at any time. Contact us at ${CONTACT_CONFIG.email} for any data-related requests.`,
      },
    ],
  },
  refund: {
    title: "Refund Policy",
    icon: RotateCcw,
    lastUpdated: "March 2025",
    sections: [
      {
        heading: "1. General Policy",
        content:
          "All purchases on ShaadiLink are final. As our service provides immediate digital access to premium templates and invitation creation tools, we are unable to offer refunds once the service has been accessed.",
      },
      {
        heading: "2. Duplicate Payments",
        content:
          `If a duplicate payment occurs due to a technical error, we will review the transaction and process a refund after deducting applicable processing charges. Please contact us at ${CONTACT_CONFIG.email} with your transaction details.`,
      },
      {
        heading: "3. Erroneous Payments",
        content:
          "In cases of clearly erroneous payments (e.g., wrong amount charged), we will investigate and process a refund within 7–10 business days after verification.",
      },
      {
        heading: "4. Coupon Codes",
        content:
          "Coupon codes and promotional discounts cannot be applied retroactively to completed purchases. Each code may only be used once per account.",
      },
      {
        heading: "5. Service Issues",
        content:
          "If you experience technical issues that prevent you from using our service, please contact our support team first. We will make every effort to resolve the issue before considering a refund request.",
      },
      {
        heading: "6. Refund Processing",
        content:
          "Approved refunds will be processed back to the original payment method within 7–10 business days. Processing times may vary depending on your bank or payment provider.",
      },
    ],
  },
  shipping: {
    title: "Shipping & Delivery Policy",
    icon: Truck,
    lastUpdated: "March 2025",
    sections: [
      {
        heading: "1. Digital Service",
        content:
          "ShaadiLink is a 100% digital service. There are no physical products, printed cards, or tangible items shipped to your address.",
      },
      {
        heading: "2. Instant Delivery",
        content:
          "Upon successful payment, you will receive immediate access to your dashboard where you can create and customize your invitation. Your unique invitation link is generated instantly.",
      },
      {
        heading: "3. Access Via Dashboard",
        content:
          "All your invitations, editing tools, and sharing features are accessible through your online dashboard. Simply log in to manage everything from any device.",
      },
      {
        heading: "4. Email Confirmation",
        content:
          "You will receive an email confirmation after purchase with your account details and instructions for accessing your invitation dashboard.",
      },
      {
        heading: "5. No Physical Shipping",
        content:
          "Since ShaadiLink provides only digital products, there are no shipping charges, delivery delays, or physical logistics involved. Everything is available instantly online.",
      },
    ],
  },
};

export function LegalPage({ type, onBack }: LegalPageProps) {
  const data = legalData[type];
  const Icon = data.icon;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={onBack}
              className="gap-2 text-foreground/70 hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>

            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald text-primary-foreground">
                <Heart className="h-4 w-4 fill-current" />
              </div>
              <span className="font-display text-lg font-bold">
                Shaadi<span className="text-gold">Link</span>
              </span>
            </div>

            <div className="w-16" />
          </div>
        </div>
      </header>

      <main className="flex-1 py-12 sm:py-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl"
        >
          {/* Title */}
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 text-gold">
              <Icon className="h-5 w-5" />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              {data.title}
            </h1>
          </div>
          <p className="text-muted-foreground text-sm mb-10">
            Last updated: {data.lastUpdated}
          </p>

          {/* Sections */}
          <div className="space-y-8">
            {data.sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <h2 className="font-display text-lg font-semibold text-foreground mb-2">
                  {section.heading}
                </h2>
                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                  {section.content}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Contact note */}
          <div className="mt-12 p-5 rounded-xl border border-gold/20 bg-gold/5">
            <p className="text-sm text-muted-foreground">
              Have questions about our policies?{" "}
              <span className="text-gold font-medium">Contact us</span> at{" "}
              <a
                href={`mailto:${CONTACT_CONFIG.email}`}
                className="text-gold hover:text-gold-light underline"
              >
                {CONTACT_CONFIG.email}
              </a>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
