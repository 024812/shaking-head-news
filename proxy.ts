import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Security headers configuration
 */
function getSecurityHeaders() {
  const headers = new Headers()

  // Content Security Policy (CSP)
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com https://www.googletagmanager.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://www.google.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob: https://pagead2.googlesyndication.com",
    "font-src 'self' data:",
    "connect-src 'self' https://news.ravelloh.top https://accounts.google.com https://*.upstash.io https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net",
    "frame-src 'self' https://accounts.google.com https://googleads.g.doubleclick.net https://www.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ]
  headers.set('Content-Security-Policy', cspDirectives.join('; '))

  // Prevent MIME type sniffing
  headers.set('X-Content-Type-Options', 'nosniff')

  // Prevent clickjacking
  headers.set('X-Frame-Options', 'DENY')

  // XSS Protection (legacy browsers)
  headers.set('X-XSS-Protection', '1; mode=block')

  // Referrer Policy
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Permissions Policy (formerly Feature Policy)
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()')

  // Strict Transport Security (HTTPS only)
  if (process.env.NODE_ENV === 'production') {
    headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  }

  return headers
}

/**
 * CORS configuration for API routes
 */
function setCorsHeaders(response: NextResponse, request: NextRequest) {
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')

  // 动态允许同源请求和特定域名的请求
  // Dynamically allow same-origin requests and specific domains
  const isAllowed =
    origin &&
    (origin.includes(host!) || // Same host
      origin.endsWith('.oheng.com') || // Subdomains of oheng.com
      origin.includes('024812.xyz') || // Old domain
      origin.includes('localhost')) // Local development

  if (isAllowed) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }

  return response
}

export async function proxy(request: NextRequest) {
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 })
    return setCorsHeaders(response, request)
  }

  const session = await auth()

  // 保护需要认证的路由
  const protectedPaths = ['/settings', '/stats', '/rss']
  const isProtected = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  if (isProtected && !session) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Create response with security headers
  const response = NextResponse.next()

  // Apply security headers
  const securityHeaders = getSecurityHeaders()
  securityHeaders.forEach((value, key) => {
    response.headers.set(key, value)
  })

  // Apply CORS headers for API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    setCorsHeaders(response, request)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

export default proxy
