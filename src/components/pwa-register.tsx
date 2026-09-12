"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function PWARegister() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Service Worker handling
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const isDev =
        process.env.NODE_ENV === "development" ||
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";

      if (isDev) {
        // Automatically unregister service workers and purge caches in dev to avoid Turbopack chunk collisions
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const reg of registrations) {
            reg.unregister();
          }
        });
        if ("caches" in window) {
          caches.keys().then((keys) => {
            keys.forEach((k) => caches.delete(k));
          });
        }
      } else {
        window.addEventListener("load", () => {
          navigator.serviceWorker
            .register("/sw.js")
            .catch((err) => {
              console.warn("Service worker registration error:", err);
            });
        });
      }
    }

    // Monitor Online/Offline connectivity
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setIsOffline(true);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-amber-950/90 border border-amber-500/40 text-amber-200 text-xs font-medium rounded-full shadow-xl backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-300"
    >
      <WifiOff className="w-3.5 h-3.5 text-amber-400" />
      <span>Offline Mode — Viewing saved invitation</span>
    </div>
  );
}
