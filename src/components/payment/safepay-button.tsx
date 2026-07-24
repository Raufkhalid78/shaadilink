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

      const SafepayButton = (window as any).safepay.Button;
      if (SafepayButton && typeof SafepayButton === 'function') {
        const buttonInstance = SafepayButton({
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
        });

        if (buttonInstance && buttonInstance.render) {
          buttonInstance.render(containerRef.current);
          renderedRef.current = true;
        } else {
          console.error("Safepay button instance does not have a render method.");
        }
      } else {
        console.error("safepay.Button is not a valid zoid component function.");
      }
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
        className="w-full min-h-[50px] block"
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

