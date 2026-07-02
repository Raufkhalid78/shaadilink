"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLanguage } from "@/components/language-provider";

export function NewsletterForm() {
  const { t, language } = useLanguage();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      if (res.ok) {
        setSubmitted(true);
        toast.success(language === 'en' ? "You're subscribed! We'll keep you updated." : "آپ سبسکرائب ہو گئے ہیں! ہم آپ کو باخبر رکھیں گے۔");
        setNewsletterEmail('');
      } else {
        toast.error(language === 'en' ? 'Could not subscribe. Please try again.' : 'سبسکرائب کرنے میں ناکامی۔ دوبارہ کوشش کریں۔');
      }
    } catch {
      toast.error(language === 'en' ? 'Network error. Please try again.' : 'نیٹ ورک کی خرابی۔ دوبارہ کوشش کریں۔');
    }
  };

  return (
    <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-2">
      <Input
        type="email"
        placeholder={language === 'en' ? "Your email address" : "آپ کا ای میل ایڈریس"}
        value={newsletterEmail}
        onChange={(e) => setNewsletterEmail(e.target.value)}
        className="h-10 bg-white/8 border-white/10 text-white placeholder:text-white/25 text-sm focus:border-gold/50 focus:ring-0 rounded-xl"
      />
      <Button
        type="submit"
        disabled={submitted}
        className="h-10 bg-gold hover:bg-gold-light text-emerald-dark font-semibold border-none rounded-xl gap-2 transition-all duration-300"
      >
        <Send className="w-3.5 h-3.5" />
        {submitted
          ? (language === 'en' ? "Subscribed! 🎉" : "سبسکرائب ہو گیا! 🎉")
          : (language === 'en' ? "Subscribe" : "سبسکرائب کریں")}
      </Button>
    </form>
  );
}
