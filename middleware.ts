import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // If Supabase auth drops the user at the root URL (e.g. because of unconfigured Redirect URIs),
  // we catch the 'code' parameter and redirect them properly to the callback route.
  if (request.nextUrl.searchParams.has('code') && !request.nextUrl.pathname.startsWith('/api/auth/callback')) {
    const code = request.nextUrl.searchParams.get('code')!
    const nextUrl = new URL('/api/auth/callback', request.url)
    nextUrl.searchParams.set('code', code)
    if (request.nextUrl.searchParams.has('next')) {
      nextUrl.searchParams.set('next', request.nextUrl.searchParams.get('next')!)
    } else {
      nextUrl.searchParams.set('next', '/dashboard') // Default landing page after login
    }
    return NextResponse.redirect(nextUrl)
  }

  const response = await updateSession(request)
  
  const isDev = process.env.NODE_ENV === 'development';
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

  // Enforcing CSP policy
  const cspHeader = `
    default-src 'self';
    script-src 'self' ${isDev ? "'unsafe-eval'" : ""} 'unsafe-inline' https://unpkg.com https://www.youtube.com blob:;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https://*.supabase.co https://images.unsplash.com https://lh3.googleusercontent.com;
    font-src 'self' data: https://fonts.gstatic.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-src 'self' https://www.youtube.com https://*.getsafepay.com https://getsafepay.com https://*.getsafepay.pk https://getsafepay.pk https://maps.google.com https://www.google.com;
    frame-ancestors 'none';
    connect-src 'self' https://*.supabase.co https://*.getsafepay.com https://getsafepay.com https://*.getsafepay.pk https://getsafepay.pk https://api.getsafepay.com https://sandbox.api.getsafepay.com https://unpkg.com *.sentry.io https://*.sentry.io https://*.ingest.sentry.io;
    media-src 'self' blob:;
    worker-src 'self' blob:;
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim()

  // Strict Report-Only CSP policy with nonce to observe any inline execution without blocking production
  const reportOnlyCsp = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' ${isDev ? "'unsafe-eval'" : ""} https://unpkg.com https://www.youtube.com blob:;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https://*.supabase.co https://images.unsplash.com https://lh3.googleusercontent.com;
    font-src 'self' data: https://fonts.gstatic.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-src 'self' https://www.youtube.com https://*.getsafepay.com https://getsafepay.com https://*.getsafepay.pk https://getsafepay.pk https://maps.google.com https://www.google.com;
    frame-ancestors 'none';
    connect-src 'self' https://*.supabase.co https://*.getsafepay.com https://getsafepay.com https://*.getsafepay.pk https://getsafepay.pk https://api.getsafepay.com https://sandbox.api.getsafepay.com https://unpkg.com *.sentry.io https://*.sentry.io https://*.ingest.sentry.io;
  `.replace(/\s{2,}/g, ' ').trim()

  response.headers.set('Content-Security-Policy', cspHeader)
  response.headers.set('Content-Security-Policy-Report-Only', reportOnlyCsp)
  response.headers.set('x-nonce', nonce)
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
