"use client";

import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
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
  const [SafepayComponent, setSafepayComponent] = useState<React.ElementType | null>(null);

  useEffect(() => {
    // If it was already loaded (e.g. fast refresh or navigating back)
    if (typeof window !== "undefined" && (window as any).safepay) {
      if (!SafepayComponent) {
        const SafepayButtonInstance = (window as any).safepay.Button.driver("react", {
          React: React,
          ReactDOM: ReactDOM,
        });
        setSafepayComponent(() => SafepayButtonInstance);
      }
      setIsScriptLoaded(true);
    }
  }, [SafepayComponent]);

  const handleScriptLoad = () => {
    if (typeof window !== "undefined" && (window as any).safepay) {
      const SafepayButtonInstance = (window as any).safepay.Button.driver("react", {
        React: React,
        ReactDOM: ReactDOM,
      });
      setSafepayComponent(() => SafepayButtonInstance);
      setIsScriptLoaded(true);
    }
  };

  const env = (process.env.NEXT_PUBLIC_SAFEPAY_ENVIRONMENT || "sandbox") as "sandbox" | "production";
  const apiKey = process.env.NEXT_PUBLIC_SAFEPAY_API_KEY || "";

  return (
    <>
      <Script
        src="https://unpkg.com/@sfpy/checkout-components@1.0.1/dist/sfpy-checkout.js"
        strategy="lazyOnload"
        onLoad={handleScriptLoad}
      />
      {!isScriptLoaded || !SafepayComponent ? (
        <div className="h-12 w-full animate-pulse bg-gold/20 rounded-lg flex items-center justify-center text-sm text-gold-dark font-medium">
          Loading Secure Checkout...
        </div>
      ) : (
        <SafepayComponent
          env={env}
          client={{
            [env]: apiKey,
          }}
          style={{
            mode: "light",
            size: "large",
            variant: "primary",
          }}
          orderId={orderId}
          payment={{
            currency: "PKR",
            amount: amount,
          }}
          onPayment={onPayment}
          onCancel={onCancel}
        />
      )}
    </>
  );
}

