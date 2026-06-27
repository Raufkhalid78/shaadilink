"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { Language, TranslationKey, translations } from "@/lib/i18n"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: TranslationKey) => translations['en'][key],
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('shaadilink_lang') as Language
    if (saved && (saved === 'en' || saved === 'ur')) {
      setLanguageState(saved)
    }
    setMounted(true)
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('shaadilink_lang', lang)
    if (lang === 'ur') {
      document.documentElement.dir = 'rtl'
      document.documentElement.lang = 'ur'
    } else {
      document.documentElement.dir = 'ltr'
      document.documentElement.lang = 'en'
    }
  }

  // Ensure SSR and initial client render match (avoid hydration mismatch on text)
  // By defaulting to English until mounted, though this can cause a flash. 
  // It is acceptable for simple client-side i18n.
  const t = (key: TranslationKey) => {
    if (!mounted) return translations['en'][key]
    return translations[language][key] || translations['en'][key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
