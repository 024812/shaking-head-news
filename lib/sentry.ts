/**
 * Sentry Error Monitoring Configuration
 *
 * This module configures Sentry for error tracking and performance monitoring.
 * Sentry helps capture and report errors in production, providing detailed
 * stack traces and context for debugging.
 *
 * Setup Instructions:
 * 1. Install Sentry: npm install @sentry/nextjs
 * 2. Run: npx @sentry/wizard@latest -i nextjs
 * 3. Add NEXT_PUBLIC_SENTRY_DSN to environment variables
 * 4. Configure sentry.client.config.ts and sentry.server.config.ts
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

export interface SentryConfig {
  dsn?: string
  environment: string
  tracesSampleRate: number
  replaysSessionSampleRate: number
  replaysOnErrorSampleRate: number
  enabled: boolean
}

/**
 * Get Sentry configuration based on environment
 */
export function getSentryConfig(): SentryConfig {
  const isProduction = process.env.NODE_ENV === 'production'
  const isDevelopment = process.env.NODE_ENV === 'development'

  return {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',

    // Performance Monitoring: Sample 100% in dev, 10% in production
    tracesSampleRate: isDevelopment ? 1.0 : 0.1,

    // Session Replay: Sample 10% of sessions in production
    replaysSessionSampleRate: isProduction ? 0.1 : 0,

    // Session Replay: Sample 100% of sessions with errors
    replaysOnErrorSampleRate: isProduction ? 1.0 : 0,

    // Only enable in production if DSN is configured
    enabled: isProduction && !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  }
}

/**
 * Initialize Sentry (to be called in sentry.client.config.ts)
 *
 * @example
 * ```typescript
 * // sentry.client.config.ts
 * import * as Sentry from '@sentry/nextjs'
 * import { initSentry } from '@/lib/sentry'
 *
 * initSentry(Sentry)
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Sentry SDK type is not imported to avoid dependency
export function initSentry(Sentry: any) {
  const config = getSentryConfig()

  if (!config.enabled) {
    console.log('[Sentry] Disabled in', config.environment)
    return
  }

  Sentry.init({
    dsn: config.dsn,
    environment: config.environment,

    // Performance Monitoring
    tracesSampleRate: config.tracesSampleRate,

    // Session Replay
    replaysSessionSampleRate: config.replaysSessionSampleRate,
    replaysOnErrorSampleRate: config.replaysOnErrorSampleRate,

    // Integrations
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Filter sensitive data before sending
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    beforeSend(event: any, _hint: any) {
      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers['cookie']
        delete event.request.headers['authorization']
      }

      // Remove sensitive cookies
      if (event.request?.cookies) {
        delete event.request.cookies
      }

      // Filter out known non-critical errors
      if (event.exception?.values) {
        const errorMessage = event.exception.values[0]?.value || ''

        // Ignore network errors that are expected
        if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
          return null
        }

        // Ignore browser extension errors
        if (
          errorMessage.includes('chrome-extension://') ||
          errorMessage.includes('moz-extension://')
        ) {
          return null
        }
      }

      return event
    },

    // Ignore specific errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'chrome-extension://',
      'moz-extension://',

      // Network errors
      'NetworkError',
      'Failed to fetch',
      'Load failed',

      // Random plugins/extensions
      'atomicFindClose',
      'conduitPage',
    ],

    // Ignore specific URLs
    denyUrls: [
      // Browser extensions
      /extensions\//i,
      /^chrome:\/\//i,
      /^moz-extension:\/\//i,

      // Third-party scripts
      /graph\.facebook\.com/i,
      /connect\.facebook\.net/i,
    ],
  })

  console.log('[Sentry] Initialized in', config.environment)
}

/**
 * Capture an exception manually
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Context can contain any type of data for error logging
export function captureException(error: Error, context?: Record<string, any>) {
  const config = getSentryConfig()

  if (!config.enabled) {
    console.error('[Sentry] Error (not sent):', error, context)
    return
  }

  // This will be available after Sentry is initialized
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Sentry is a global from external script
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Sentry is a global from external script
    const Sentry = (window as any).Sentry

    if (context) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Sentry scope type is not imported
      Sentry.withScope((scope: any) => {
        Object.entries(context).forEach(([key, value]) => {
          scope.setContext(key, value)
        })
        Sentry.captureException(error)
      })
    } else {
      Sentry.captureException(error)
    }
  }
}

/**
 * Capture a message manually
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  const config = getSentryConfig()

  if (!config.enabled) {
    console.log(`[Sentry] ${level.toUpperCase()} (not sent):`, message)
    return
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Sentry is a global from external script
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Sentry is a global from external script
    const Sentry = (window as any).Sentry
    Sentry.captureMessage(message, level)
  }
}

/**
 * Set user context for error tracking
 */
export function setUser(user: { id: string; email?: string; username?: string } | null) {
  const config = getSentryConfig()

  if (!config.enabled) {
    return
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Sentry is a global from external script
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Sentry is a global from external script
    const Sentry = (window as any).Sentry
    Sentry.setUser(user)
  }
}

/**
 * Add breadcrumb for debugging context
 */
export function addBreadcrumb(breadcrumb: {
  message: string
  category?: string
  level?: 'info' | 'warning' | 'error'
  data?: Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any -- Breadcrumb data can be any type
}) {
  const config = getSentryConfig()

  if (!config.enabled) {
    return
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Sentry is a global from external script
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Sentry is a global from external script
    const Sentry = (window as any).Sentry
    Sentry.addBreadcrumb(breadcrumb)
  }
}

/**
 * Start a performance transaction
 */
export function startTransaction(name: string, op: string) {
  const config = getSentryConfig()

  if (!config.enabled) {
    return null
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Sentry is a global from external script
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Sentry is a global from external script
    const Sentry = (window as any).Sentry
    return Sentry.startTransaction({ name, op })
  }

  return null
}
