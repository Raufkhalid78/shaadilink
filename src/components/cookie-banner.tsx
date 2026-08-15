'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { m, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Cookie, X } from 'lucide-react'

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has already accepted or declined cookies
    const consent = localStorage.getItem('shaadilink_cookie_consent')
    if (!consent) {
      setIsVisible(true)
    }
  }, [])

  const handleConsent = (accepted: boolean) => {
    localStorage.setItem('shaadilink_cookie_consent', accepted ? 'accepted' : 'declined')
    setIsVisible(false)
    if (accepted) {
      // Initialize analytics here if they accepted
      window.dispatchEvent(new Event('cookies_accepted'))
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <m.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-[99999] p-4 bg-background/95 backdrop-blur-md border-t border-border shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="text-sm text-muted-foreground flex-1">
            We use essential cookies to make our site work. With your consent, we may also use non-essential cookies to improve user experience and analyze website traffic. By clicking &quot;Accept&quot;, you agree to our website&apos;s cookie use as described in our{' '}
            <Link href="/privacy" className="text-gold underline hover:text-gold-light">
              Privacy Policy
            </Link>.
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              className="flex-1 sm:flex-none border-border/50 text-muted-foreground"
              onClick={() => handleConsent(false)}
            >
              Decline
            </Button>
            <Button
              className="flex-1 sm:flex-none bg-gold text-background hover:bg-gold-light"
              onClick={() => handleConsent(true)}
            >
              Accept
            </Button>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  )
}
