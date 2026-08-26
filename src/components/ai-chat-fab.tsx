"use client";

import { MessageCircle, X, Send, Bot, QrCode, Phone } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useChat } from "ai/react";
import { QRCodeSVG } from "qrcode.react";
import ReactMarkdown from "react-markdown";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";

export function AIChatFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
  });

  // Show FAB after a short delay so it doesn't distract immediately
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Close on Escape or click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        isOpen &&
        chatContainerRef.current &&
        !chatContainerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside, { passive: true });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Don't show on the actual invitation viewer pages
  if (pathname?.startsWith("/inv/")) return null;

  const whatsappNumber = "447517879333";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Hi ShaadiLink, I need some help!`;

  if (!isVisible) return null;

  return (
    <div
      ref={chatContainerRef}
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[999999] pointer-events-auto flex flex-col items-end select-none"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        paddingRight: "env(safe-area-inset-right, 0px)",
      }}
    >
      {/* Chat Window Panel */}
      {isOpen && (
        <div
          className="bg-card/95 backdrop-blur-xl border border-border/80 rounded-2xl shadow-2xl w-[calc(100vw-2rem)] sm:w-96 max-w-[calc(100vw-2rem)] mb-3 flex flex-col origin-bottom-right overflow-hidden transition-all duration-200 animate-in fade-in zoom-in-95"
          style={{ maxHeight: "calc(100dvh - 120px)" }}
        >
          {/* Header */}
          <div className="bg-emerald-950 text-white p-4 flex justify-between items-center shadow-md z-10 relative border-b border-gold/30">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-gold">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-sm leading-tight text-white flex items-center gap-1.5">
                  ShaadiLink Assistant
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </h4>
                <p className="text-[11px] text-emerald-200/80">Online & ready to help</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowQR(!showQR);
                }}
                className="p-1.5 bg-white/10 hover:bg-white/20 active:scale-95 rounded-lg transition-all touch-manipulation cursor-pointer text-gold"
                aria-label="Contact Human Support"
                title="Contact Human Support on WhatsApp"
              >
                <QrCode className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                className="p-1.5 hover:bg-white/20 active:scale-95 rounded-lg transition-all touch-manipulation cursor-pointer text-white/80 hover:text-white"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* WhatsApp QR Fallback Overlay */}
          {showQR && (
            <div className="bg-muted border-b border-border/60 overflow-hidden flex-shrink-0 animate-in slide-in-from-top-2">
              <div className="p-5 flex flex-col items-center text-center space-y-3">
                <p className="text-xs font-semibold text-foreground">Scan or tap to chat on WhatsApp with a human</p>
                <div className="bg-white p-2 rounded-xl shadow-sm border border-border/40">
                  <QRCodeSVG value={whatsappUrl} size={120} />
                </div>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#20bd5a] active:scale-98 text-white font-semibold py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-all text-xs shadow-sm touch-manipulation"
                >
                  <WhatsAppIcon className="w-4 h-4 text-white" />
                  Chat on WhatsApp Directly
                </a>
              </div>
            </div>
          )}

          {/* Chat Messages Area */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-3.5 bg-background/60 min-h-[220px]"
          >
            {/* Intro Welcome Bubble */}
            <div className="flex gap-2 max-w-[88%]">
              <div className="w-6 h-6 rounded-full bg-gold/15 border border-gold/30 flex-shrink-0 flex items-center justify-center mt-1 text-gold">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="bg-card border border-border/60 text-foreground rounded-2xl rounded-tl-sm p-3 text-xs leading-relaxed shadow-sm">
                Assalam-o-Alaikum! 👋 I&apos;m the ShaadiLink AI Assistant. How can I help you with your wedding invitation plans today?
              </div>
            </div>

            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 max-w-[88%] ${m.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-1 ${
                    m.role === "user"
                      ? "bg-gold text-emerald-950 font-bold text-[10px]"
                      : "bg-gold/15 border border-gold/30 text-gold"
                  }`}
                >
                  {m.role === "user" ? "U" : <Bot className="w-3.5 h-3.5" />}
                </div>
                <div
                  className={`rounded-2xl p-3 text-xs leading-relaxed whitespace-pre-wrap break-words overflow-hidden shadow-sm ${
                    m.role === "user"
                      ? "bg-emerald text-white rounded-tr-sm"
                      : "bg-card border border-border/60 text-foreground rounded-tl-sm"
                  }`}
                >
                  {m.role === "user" ? (
                    m.content
                  ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none break-words text-xs [&>p]:mb-0 [&>p:not(:first-child)]:mt-2 [&_a]:text-gold [&_a]:underline [&_a]:font-medium hover:[&_a]:text-gold-light">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 max-w-[88%]">
                <div className="w-6 h-6 rounded-full bg-gold/15 border border-gold/30 flex-shrink-0 flex items-center justify-center mt-1 text-gold">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-card border border-border/60 text-foreground rounded-2xl rounded-tl-sm p-3 text-xs flex items-center gap-1.5 h-9">
                  <span className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  <span className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="p-3 bg-card border-t border-border/60">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Ask about templates, pricing, RSVP..."
                className="w-full bg-muted/60 border border-input focus:border-gold focus:ring-1 focus:ring-gold rounded-full pl-4 pr-11 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none transition-all"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-1 w-8 h-8 flex items-center justify-center rounded-full bg-gold hover:bg-gold-light active:scale-95 text-emerald-950 disabled:opacity-40 disabled:cursor-not-allowed transition-all touch-manipulation cursor-pointer font-bold shadow-sm"
                aria-label="Send message"
              >
                <Send className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>
            <div className="text-center mt-1.5">
              <span className="text-[10px] text-muted-foreground/70">ShaadiLink AI • Available 24/7</span>
            </div>
          </form>
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="w-14 h-14 rounded-full bg-emerald-900 border-2 border-gold/60 text-white shadow-2xl flex items-center justify-center hover:bg-emerald-800 active:scale-95 transition-all duration-200 cursor-pointer touch-manipulation relative focus:outline-none focus:ring-2 focus:ring-gold/50 shadow-emerald-950/40"
        aria-label={isOpen ? "Close ShaadiLink Assistant" : "Open ShaadiLink Assistant"}
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Bot className="w-7 h-7 text-gold drop-shadow-md" />
        )}

        {/* Pulsing notification indicator */}
        {!isOpen && messages.length === 0 && (
          <span className="absolute top-0 right-0 flex h-3.5 w-3.5 -mt-0.5 -mr-0.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-gold border-2 border-emerald-900" />
          </span>
        )}
      </button>
    </div>
  );
}
