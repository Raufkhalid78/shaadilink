"use client";

import { m, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export function WhatsAppFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  // Show FAB after a short delay so it doesn't distract immediately
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Don't show on the actual invitation viewer pages (we don't want guests contacting support)
  if (pathname?.startsWith("/inv/")) return null;

  const whatsappNumber = "447517879333"; // Replace with actual number
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Hi ShaadiLink, I have a question about creating my wedding invitation.`;

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
          <AnimatePresence>
            {isOpen && (
              <m.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className="bg-card border border-border rounded-2xl shadow-2xl p-4 w-72 mb-2 origin-bottom-right"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald/20 flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-emerald" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Chat with us</h4>
                      <p className="text-xs text-muted-foreground">Typically replies instantly</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Close chat"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-sm mb-4">
                  Hi there! 👋 Need help creating your perfect wedding invitation? We're here for you.
                </div>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-medium py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Start WhatsApp Chat
                </a>
              </m.div>
            )}
          </AnimatePresence>

          <m.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className="w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 flex items-center justify-center hover:bg-[#20bd5a] transition-colors relative"
            aria-label="Chat on WhatsApp"
          >
            {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
            
            {/* Notification badge pulse */}
            {!isOpen && (
              <span className="absolute top-0 right-0 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
          </m.button>
        </div>
      )}
    </AnimatePresence>
  );
}
