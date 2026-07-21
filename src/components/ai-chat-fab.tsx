"use client";

import { m, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, QrCode, Phone } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useChat } from "ai/react";
import { QRCodeSVG } from "qrcode.react";
import ReactMarkdown from "react-markdown";

export function AIChatFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
  });

  // Show FAB after a short delay so it doesn't distract immediately
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Don't show on the actual invitation viewer pages
  if (pathname?.startsWith("/inv/")) return null;

  const whatsappNumber = "447517879333";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Hi ShaadiLink, I need some help!`;

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-4">
          <AnimatePresence>
            {isOpen && (
              <m.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className="bg-card border border-border rounded-2xl shadow-2xl w-[calc(100vw-2rem)] sm:w-96 mb-2 flex flex-col origin-bottom-right overflow-hidden"
                style={{ maxHeight: "calc(100vh - 120px)" }}
              >
                {/* Header */}
                <div className="bg-primary text-primary-foreground p-4 flex justify-between items-center shadow-md z-10 relative">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">ShaadiLink Assistant</h4>
                      <p className="text-xs opacity-80">We're online!</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowQR(!showQR)}
                      className="p-1.5 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-lg transition-colors"
                      aria-label="Contact Human Support"
                      title="Contact Human Support"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-1.5 hover:bg-primary-foreground/20 rounded-lg transition-colors"
                      aria-label="Close chat"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* WhatsApp QR Fallback Overlay */}
                <AnimatePresence>
                  {showQR && (
                    <m.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-muted border-b overflow-hidden flex-shrink-0"
                    >
                      <div className="p-5 flex flex-col items-center text-center space-y-4">
                        <p className="text-sm text-muted-foreground">Scan to chat with a human on WhatsApp</p>
                        <div className="bg-white p-2 rounded-xl shadow-sm">
                          <QRCodeSVG value={whatsappUrl} size={120} />
                        </div>
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-medium py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm shadow-sm"
                        >
                          <Phone className="w-4 h-4" />
                          Chat on WhatsApp
                        </a>
                      </div>
                    </m.div>
                  )}
                </AnimatePresence>

                {/* Chat Messages */}
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20 min-h-[200px]"
                >
                  <div className="flex gap-2 max-w-[85%]">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center mt-1">
                      <Bot className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-tl-sm p-3 text-sm">
                      Hi there! 👋 I'm the ShaadiLink AI Assistant. How can I help you with your wedding invitations today?
                    </div>
                  </div>
                  
                  {messages.map((m) => (
                    <div 
                      key={m.id} 
                      className={`flex gap-2 max-w-[85%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                    >
                      <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-1 ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'}`}>
                        {m.role === 'user' ? <span className="text-[10px] font-bold">U</span> : <Bot className="w-3.5 h-3.5" />}
                      </div>
                      <div className={`rounded-2xl p-3 text-sm whitespace-pre-wrap break-words overflow-hidden ${
                        m.role === 'user' 
                          ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                          : 'bg-muted rounded-tl-sm'
                      }`}>
                        {m.role === 'user' ? (
                          m.content
                        ) : (
                          <div className="prose prose-sm dark:prose-invert max-w-none break-words [&>p]:mb-0 [&>p:not(:first-child)]:mt-4 [&_a]:text-primary [&_a]:underline [&_a]:font-medium hover:[&_a]:text-primary/80">
                            <ReactMarkdown>
                              {m.content}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex gap-2 max-w-[85%]">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center mt-1">
                        <Bot className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="bg-muted rounded-2xl rounded-tl-sm p-3 text-sm flex items-center gap-1.5 h-10">
                        <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                        <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <form onSubmit={handleSubmit} className="p-3 bg-background border-t">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={input}
                      onChange={handleInputChange}
                      placeholder="Ask me anything..."
                      className="w-full bg-muted/50 border border-input focus:border-primary focus:ring-1 focus:ring-primary rounded-full pl-4 pr-12 py-2.5 text-sm outline-none transition-all"
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      className="absolute right-1 w-8 h-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4 ml-0.5" />
                    </button>
                  </div>
                  <div className="text-center mt-2">
                    <span className="text-[10px] text-muted-foreground opacity-60">AI can make mistakes. Verify important info.</span>
                  </div>
                </form>
              </m.div>
            )}
          </AnimatePresence>

          <m.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors relative"
            aria-label="Open AI Assistant"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
            
            {/* Notification badge pulse */}
            {!isOpen && messages.length === 0 && (
              <span className="absolute top-0 right-0 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
              </span>
            )}
          </m.button>
        </div>
      )}
    </AnimatePresence>
  );
}
