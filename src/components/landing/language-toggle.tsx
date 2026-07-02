"use client";

import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language-provider";
import { cn } from "@/lib/utils";

interface LanguageToggleProps {
  isMobile?: boolean;
}

export function LanguageToggle({ isMobile }: LanguageToggleProps) {
  const { language, setLanguage } = useLanguage();

  if (isMobile) {
    return (
      <div className="flex items-center justify-between px-3 py-2.5 bg-white/5 rounded-xl mb-4 border border-white/5">
        <span className="text-xs font-semibold text-white/70 flex items-center gap-2">
          <Globe className="w-4 h-4 text-gold" />
          Language / زبان
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLanguage(language === 'en' ? 'ur' : 'en')}
          className="text-gold hover:bg-gold/10 font-bold px-3 py-1 h-auto text-xs"
        >
          {language === 'en' ? 'اردو' : 'English'}
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setLanguage(language === 'en' ? 'ur' : 'en')}
      className="text-white hover:text-gold hover:bg-gold/10"
      title={language === 'en' ? 'Switch to Urdu' : 'Switch to English'}
    >
      <Globe className="w-5 h-5" />
      <span className="sr-only">Toggle Language</span>
    </Button>
  );
}
