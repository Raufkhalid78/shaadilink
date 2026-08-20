"use client";

import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CONTACT_CONFIG } from "@/lib/config";
import { AlertTriangle, ArrowLeft, Mail, RefreshCw } from "lucide-react";
import { m } from "framer-motion";

function AuthErrorContent() {
  const params = useSearchParams();
  const errorCode = params.get("error");
  const errorDescription = params.get("error_description");

  // Format a user-friendly error message based on common Supabase error codes
  let title = "Sign-In Link Expired or Invalid";
  let message = "Your sign-in or verification link may have expired, already been used, or encountered a connection timeout.";

  if (errorCode === "access_denied") {
    title = "Access Request Cancelled";
    message = "Sign-in was cancelled or access was denied. Please try again to continue to your dashboard.";
  } else if (errorDescription) {
    message = errorDescription;
  }

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md w-full space-y-8 text-center relative z-10"
    >
      {/* Brand Logo */}
      <div className="flex justify-center">
        <div className="relative w-20 h-20 mb-2">
          <Image
            src="/logo.svg"
            alt="ShaadiLink Logo"
            fill
            className="object-contain drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]"
            priority
          />
        </div>
      </div>

      {/* Warning Icon Badge */}
      <div className="flex justify-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/5">
          <AlertTriangle className="w-7 h-7" />
        </div>
      </div>

      {/* Heading & Explanation */}
      <div className="space-y-3">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
          {title}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-sm mx-auto leading-relaxed">
          {message}
        </p>
        {errorCode && (
          <p className="text-[11px] font-mono text-muted-foreground/60 tracking-wider">
            Error Ref: {errorCode}
          </p>
        )}
      </div>

      {/* Gold Divider */}
      <div className="flex items-center justify-center gap-3">
        <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold/50" />
        <div className="w-1.5 h-1.5 rounded-full bg-gold/60" />
        <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold/50" />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <Button
          asChild
          variant="default"
          className="gap-2 bg-emerald hover:bg-emerald-dark text-white shadow-md shadow-emerald/20 h-11 px-6 font-medium"
        >
          <Link href="/login">
            <RefreshCw className="h-4 w-4" />
            Try Sign-In Again
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className="gap-2 border-gold/30 hover:bg-gold/10 text-foreground h-11 px-5 font-medium"
        >
          <a href={`mailto:${CONTACT_CONFIG.email}?subject=Sign-in%20Assistance%20Request`}>
            <Mail className="h-4 w-4 text-gold" />
            Contact Support
          </a>
        </Button>
      </div>

      {/* Return to Home link */}
      <div className="pt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gold transition-colors duration-200"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Homepage</span>
        </Link>
      </div>
    </m.div>
  );
}

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-emerald-dark/15 to-background pointer-events-none" />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(180,145,77,0.06) 0%, transparent 70%)" }}
      />

      <Suspense fallback={
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Checking authentication state...</p>
        </div>
      }>
        <AuthErrorContent />
      </Suspense>
    </div>
  );
}
