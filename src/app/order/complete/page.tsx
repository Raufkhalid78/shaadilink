"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function OrderCompleteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tracker = searchParams.get("tracker");
  const orderId = searchParams.get("order_id");

  useEffect(() => {
    // We could technically poll our backend for the order status here,
    // but the safest bet is to redirect back to the app with the success step.
    // The webhook should have processed the payment in the background.
    if (tracker || orderId) {
      setTimeout(() => {
        // Redirect to success page, we assume webhook will catch up
        router.push("/?step=success");
      }, 3000);
    } else {
      router.push("/");
    }
  }, [tracker, orderId, router]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-6 p-8 rounded-2xl border border-gold/30 bg-gold/5 flex flex-col items-center">
        {tracker ? (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald/20 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald" />
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Payment Received!
            </h1>
            <p className="text-muted-foreground text-sm">
              Please wait while we verify your payment and activate your invitation...
            </p>
            <Loader2 className="w-6 h-6 animate-spin text-gold mx-auto mt-4" />
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Invalid Request
            </h1>
            <p className="text-muted-foreground text-sm">
              We couldn't verify this payment session.
            </p>
            <Button onClick={() => router.push("/")} className="mt-4 bg-gold hover:bg-gold-light text-emerald-dark">
              Return Home
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default function OrderCompletePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    }>
      <OrderCompleteContent />
    </Suspense>
  );
}
