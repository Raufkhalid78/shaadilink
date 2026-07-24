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
  const [isButtonReady, setIsButtonReady] = useState(false);
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
          buttonInstance.render(containerRef.current).then(() => {
            setIsButtonReady(true);
          }).catch((err: any) => {
            console.error("Safepay render failed", err);
            setIsButtonReady(true); // show it anyway to reveal error
          });
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
      
      <div className="relative w-full min-h-[50px]">
        {/* Beautiful Placeholder */}
        {(!isScriptLoaded || !isButtonReady) && (
          <div className="absolute inset-0 z-10 w-full animate-pulse bg-gold/5 border border-gold/20 rounded-lg flex items-center justify-center text-sm text-gold-dark font-medium shadow-inner transition-all duration-300">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gold" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Preparing Secure Checkout...
          </div>
        )}

        {/* Safepay Container (hidden while loading) */}
        <div 
          ref={containerRef} 
          className={`w-full block transition-opacity duration-700 ${isButtonReady ? "opacity-100 relative z-20" : "opacity-0 absolute inset-0 pointer-events-none"}`}
        />
      </div>
    </>
  );
}

