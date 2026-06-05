---
Task ID: 2
Agent: full-stack-developer
Task: Implement AI Urdu translation for all invitation content

Work Log:
- Read the full invitation-viewer.tsx file (~3400+ lines) to understand structure
- Read the existing /api/translate/route.ts to understand the AI translation API
- Enhanced URDU_DICT with 11 new keys: partner1, partner2, venueName, venueAddress, scratchHere, toReveal, youreInvited, march15, sunday, time7pm, pkt
- Updated translateToUrdu function to: (1) immediately set static URDU_DICT, (2) build dynamicTexts object with ALL dynamic content including events, (3) call /api/translate AI endpoint, (4) merge AI translations into state
- Added translated computed values: translatedPartner1, translatedPartner2, translatedVenueName, translatedVenueAddress
- Added getTranslatedEvent helper function that returns translated event name/date/time/description
- Replaced {partner1} → {translatedPartner1}, {partner2} → {translatedPartner2}, {venueName} → {translatedVenueName}, {venueAddress} → {translatedVenueAddress} in JSX
- Updated ScratchCard component signature to accept language and translations props
- Updated ScratchCard canvas text rendering with Urdu font support (Noto Nastaliq Urdu) and translated text
- Updated ScratchCard "Scratch to Reveal" heading with translation support
- Updated both revealed and hidden content text in ScratchCard (You're Invited, March 15 2027, Sunday, 7:00 PM, PKT)
- Updated events timeline to use getTranslatedEvent for translated event info
- Updated ScratchCard call site to pass language and translations props
- Ran lint: no errors

Stage Summary:
- All invitation content now supports AI-powered Urdu translation
- Static URDU_DICT provides instant translations for known strings
- Dynamic content (partner names, venue, events) gets AI-translated via /api/translate endpoint
- ScratchCard canvas text renders in Urdu with Noto Nastaliq Urdu font
- All animations, effects, and interaction logic remain untouched
- Lint passes with zero errors

---
Task ID: 3
Agent: main
Task: Fix bugs found during browser testing and improve translation quality priority

Work Log:
- Browser test found 2 bugs: (1) AI returning translation keys with brackets causing mismatch, (2) HTML lang/dir not updating on language switch
- Bug 1 was already auto-fixed by browser test agent: sanitized keys in translate API response
- Bug 2 was already auto-fixed: added useEffect to set document.documentElement.lang and document.documentElement.dir
- Fixed priority issue: static URDU_DICT translations now take precedence over AI translations for known keys
- Cleaned up duplicate keys in URDU_DICT (scratchHere, youreInvited, sunday, pkt had duplicate entries)
- Final browser verification confirmed all translations work correctly

Stage Summary:
- Partner names (Ahmed → احمد, Fatima → فاطمہ) translated ✅
- Event names (Mehndi → مہندی, Baraat → بارات, Nikkah → نکاح, Walima → ولیمہ) translated ✅
- Venue name and address translated ✅
- Page correctly switches to RTL with lang="ur" dir="rtl" ✅
- Scratch card text in Urdu ✅
- All sections (countdown, RSVP, wishes, venue, timeline) properly translated ✅
- Static dictionary takes priority over AI for better quality control ✅
