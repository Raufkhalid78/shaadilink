# ShaadiLink — Digital Wedding Invitations Platform

> **Live Website:** [https://www.shaadilink.com.pk](https://www.shaadilink.com.pk)  
> **Tech Stack:** Next.js 16 (App Router, Turbopack), TypeScript, Tailwind CSS, Shadcn UI, Supabase (PostgreSQL, Auth, Storage), Safepay Gateway, Upstash Redis, Resend, Vitest.

---

## 🚀 Features

- **Interactive Digital Invitations**: 3D Animated Door Reveals, Quranic/Bible verse cards, Google Maps venue navigation, background oriental music player, wedding itinerary timeline, and interactive wishes wall.
- **Dynamic Urdu/English Bilingualism**: Instant client-side English to Urdu translation with full RTL layout support.
- **Guest Management & RSVP**: Personalized guest links, RSVP confirmation tracking, custom seating limits, and automated host email notifications.
- **Secure Safepay Payments**: Automated checkout with HMAC SHA-512 webhook signature verification, atomic transactional fulfillment, and affiliate commission attribution.
- **Affiliate & Referral System**: Custom promo codes, 10% discounts for couples, 10% commissions for creators, and admin approval workflows.
- **Comprehensive Admin Suite**: Registered user management, order records, customer reviews moderation, contact messages, and system settings.

---

## 🛠️ Environment Variables Setup

Create a `.env.local` file in the root directory:

```env
# Next.js Public
NEXT_PUBLIC_APP_URL="https://www.shaadilink.com.pk"
NEXT_PUBLIC_SUPABASE_URL="https://your-supabase-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# Supabase Service Role
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Safepay Payment Gateway
SAFEPAY_API_KEY="your-safepay-api-key"
SAFEPAY_WEBHOOK_SECRET="your-safepay-webhook-secret"
SAFEPAY_ENV="production" # "sandbox" or "production"
NEXT_PUBLIC_SAFEPAY_PUBLIC_KEY="your-safepay-public-key"

# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL="https://your-upstash-instance.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-upstash-token"

# Resend Email Delivery
RESEND_API_KEY="re_your_resend_api_key"

# AI Assistant & Translations
OPENROUTER_API_KEY="sk-or-v1-..."

# Admin Access
ADMIN_EMAIL="admin@shaadilink.com.pk"
```

---

## 📦 Database Migrations

Apply the migration in `supabase/migrations/20260902_production_hardening.sql` using Supabase SQL Editor or Supabase CLI:

```bash
# Via Supabase CLI
supabase db push
```

This migration is idempotent and applies:
- Missing column additions (`slug`, `guest_links_quota`, `custom_verse_text`, etc.)
- Tables (`rsvps`, `wishes`, `guest_links`, `referral_codes`, `affiliate_commissions`)
- Performance & uniqueness indexes
- Security Definer atomic RPCs (`fulfill_order_atomic`, `increment_view_count`, `increment_promo_usage`)
- Hardened Row-Level Security (RLS) policies

---

## 🧪 Testing & Quality Assurance

```bash
# Run Unit & Integration Tests (Vitest)
npm test

# Run ESLint check
npm run lint

# Build for Production
npm run build
```

---

## 🔒 Security & Architecture Guardrails

1. **Authentication Enforcement**: Server API endpoints (`/api/upload`, `/api/payment/initiate`, `/api/invitations`) require active user session cookies.
2. **Atomic Payment Fulfillment**: Order fulfillment runs through `fulfill_order_atomic` with PostgreSQL row locks (`FOR UPDATE`), preventing duplicate activations or race conditions.
3. **Paisa Integer Validation**: Currency verification strictly compares integer Paisa (`order.amount * 100`) against gateway payloads.
4. **Resilient Rate Limiting**: Automatic sliding-window in-memory fallback protects routes if Redis is temporarily unreachable.
5. **Photo Isolation & Magic-Byte Checks**: User photo uploads inspect header magic bytes (JPEG/PNG/WebP/GIF) and store under isolated `users/{user_id}/` buckets.
