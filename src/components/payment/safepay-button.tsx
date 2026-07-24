"use client";

import React, { useEffect, useState, useRef } from "react";
import Script from "next/script";

interface SafepayButtonProps {
  orderId: string;
  amount: number;
  onPayment: (data: any) => void;
  onCancel: () => void;
}

export function SafepayButton({
  orderId,
  amount,
  onPayment,
  onCancel,
}: SafepayButtonProps) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const renderedRef = useRef(false);

  const renderSafepay = () => {
    if (!containerRef.current || renderedRef.current) return;
    if (typeof window !== "undefined" && (window as any).safepay) {
      const env = (process.env.NEXT_PUBLIC_SAFEPAY_ENVIRONMENT || "sandbox") as "sandbox" | "production";
      const apiKey = process.env.NEXT_PUBLIC_SAFEPAY_API_KEY || "";

      (window as any).safepay.Button.render({
        env: env,
        client: {
          [env]: apiKey,
        },
        style: {
          mode: "light",
          size: "large",
          variant: "primary",
        },
        orderId: orderId,
        payment: {
          currency: "PKR",
          amount: amount,
        },
        onPayment: onPayment,
        onCancel: onCancel,
      }, containerRef.current);
      
      renderedRef.current = true;
    }
  };

  useEffect(() => {
    if (isScriptLoaded) {
      renderSafepay();
    }
  }, [isScriptLoaded, orderId, amount]);

  const handleScriptLoad = () => {
    setIsScriptLoaded(true);
  };

  return (
    <>
      <Script
        src="https://unpkg.com/@sfpy/checkout-components@1.0.1/dist/sfpy-checkout.js"
        strategy="lazyOnload"
        onLoad={handleScriptLoad}
      />
      <div 
        ref={containerRef} 
        className="w-full min-h-[50px] flex items-center justify-center"
      >
        {!isScriptLoaded && (
          <div className="h-12 w-full animate-pulse bg-gold/20 rounded-lg flex items-center justify-center text-sm text-gold-dark font-medium">
            Loading Secure Checkout...
          </div>
        )}
      </div>
    </>
  );
}

