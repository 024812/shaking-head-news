/**
 * Analytics Tracking Module
 *
 * This module provides a unified interface for tracking user events and page views
 * across multiple analytics platforms (Google Analytics, Vercel Analytics, etc.)
 *
 * Setup Instructions:
 *
 * For Google Analytics:
 * 1. Add NEXT_PUBLIC_GA_ID to environment variables
 * 2. Add GA script to app/layout.tsx
 *
 * For Vercel Analytics:
 * 1. Install: npm install @vercel/analytics
 * 2. Add <Analytics /> component to app/layout.tsx
 *
 * @see https://vercel.com/docs/analytics
 * @see https://developers.google.com/analytics/devguides/collection/gtagjs
 */

export interface AnalyticsEvent {
  action: string
  category: string
  label?: string
  value?: number
  userId?: string
}

export interface PageViewEvent {
  url: string
  title?: string
  referrer?: string
}

/**
 * Check if analytics is enabled
 */
export function isAnalyticsEnabled(): boolean {
  return (
    process.env.NODE_ENV === 'production' &&
    (!!process.env.NEXT_PUBLIC_GA_ID || !!process.env.NEXT_PUBLIC_VERCEL_ANALYTICS)
  )
}

/**
 * Track a page view
 *
 * @example
 * ```typescript
 * trackPageView({
 *   url: '/news',
 *   title: 'News Page'
 * })
 * ```
 */
export function trackPageView(event: PageViewEvent) {
  if (!isAnalyticsEnabled()) {
    console.log('[Analytics] Page view (not tracked):', event.url)
    return
  }

  // Google Analytics
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- gtag is a global from external script
  if (typeof window !== 'undefined' && (window as any).gtag) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- gtag is a global from external script
    ;(window as any).gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
      page_path: event.url,
      page_title: event.title,
      page_referrer: event.referrer,
    })
  }

  // Vercel Analytics (automatically tracks page views)
  // No additional code needed if @vercel/analytics is installed
}

/**
 * Track a custom event
 *
 * @example
 * ```typescript
 * trackEvent({
 *   action: 'click',
 *   category: 'news',
 *   label: 'refresh_button',
 *   value: 1
 * })
 * ```
 */
export function trackEvent(event: AnalyticsEvent) {
  if (!isAnalyticsEnabled()) {
    console.log('[Analytics] Event (not tracked):', event)
    return
  }

  // Google Analytics
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- gtag is a global from external script
  if (typeof window !== 'undefined' && (window as any).gtag) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- gtag is a global from external script
    ;(window as any).gtag('event', event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      user_id: event.userId,
    })
  }

  // Vercel Analytics
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- va is a global from external script
  if (typeof window !== 'undefined' && (window as any).va) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- va is a global from external script
    ;(window as any).va('track', event.action, {
      category: event.category,
      label: event.label,
      value: event.value,
    })
  }
}

/**
 * Track user login
 */
export function trackLogin(method: 'google' | 'email') {
  trackEvent({
    action: 'login',
    category: 'auth',
    label: method,
  })
}

/**
 * Track user logout
 */
export function trackLogout() {
  trackEvent({
    action: 'logout',
    category: 'auth',
  })
}

/**
 * Track news refresh
 */
export function trackNewsRefresh(source?: string) {
  trackEvent({
    action: 'refresh',
    category: 'news',
    label: source || 'all',
  })
}

/**
 * Track news item click
 */
export function trackNewsClick(newsId: string, source: string) {
  trackEvent({
    action: 'click',
    category: 'news',
    label: `${source}:${newsId}`,
  })
}

/**
 * Track settings change
 */
export function trackSettingsChange(setting: string, value: string | number | boolean) {
  trackEvent({
    action: 'change',
    category: 'settings',
    label: setting,
    value: typeof value === 'number' ? value : undefined,
  })
}

/**
 * Track rotation event
 */
export function trackRotation(angle: number, mode: 'fixed' | 'continuous') {
  trackEvent({
    action: 'rotate',
    category: 'rotation',
    label: mode,
    value: Math.abs(angle),
  })
}

/**
 * Track RSS source management
 */
export function trackRSSAction(
  action: 'add' | 'remove' | 'enable' | 'disable' | 'export',
  sourceId?: string
) {
  trackEvent({
    action,
    category: 'rss',
    label: sourceId,
  })
}

/**
 * Track language change
 */
export function trackLanguageChange(from: string, to: string) {
  trackEvent({
    action: 'change_language',
    category: 'settings',
    label: `${from}_to_${to}`,
  })
}

/**
 * Track theme change
 */
export function trackThemeChange(theme: 'light' | 'dark' | 'system') {
  trackEvent({
    action: 'change_theme',
    category: 'settings',
    label: theme,
  })
}

/**
 * Track error occurrence
 */
export function trackError(error: Error, context?: string) {
  trackEvent({
    action: 'error',
    category: 'error',
    label: context || error.name,
  })
}

/**
 * Track search query
 */
export function trackSearch(query: string, resultsCount: number) {
  trackEvent({
    action: 'search',
    category: 'search',
    label: query,
    value: resultsCount,
  })
}

/**
 * Track performance metric
 */
export function trackPerformance(metric: string, value: number, rating: string) {
  trackEvent({
    action: 'performance',
    category: 'web_vitals',
    label: `${metric}_${rating}`,
    value: Math.round(value),
  })
}

/**
 * Set user properties for analytics
 */
export function setUserProperties(properties: Record<string, string | number | boolean>) {
  if (!isAnalyticsEnabled()) {
    return
  }

  // Google Analytics
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- gtag is a global from external script
  if (typeof window !== 'undefined' && (window as any).gtag) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- gtag is a global from external script
    ;(window as any).gtag('set', 'user_properties', properties)
  }
}

/**
 * Set user ID for analytics
 */
export function setUserId(userId: string | null) {
  if (!isAnalyticsEnabled()) {
    return
  }

  // Google Analytics
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- gtag is a global from external script
  if (typeof window !== 'undefined' && (window as any).gtag) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- gtag is a global from external script
    ;(window as any).gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
      user_id: userId,
    })
  }
}

/**
 * Track conversion event
 */
export function trackConversion(conversionId: string, value?: number) {
  if (!isAnalyticsEnabled()) {
    return
  }

  // Google Analytics
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- gtag is a global from external script
  if (typeof window !== 'undefined' && (window as any).gtag) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- gtag is a global from external script
    ;(window as any).gtag('event', 'conversion', {
      send_to: conversionId,
      value: value,
      currency: 'USD',
    })
  }
}

/**
 * Track timing event
 */
export function trackTiming(category: string, variable: string, value: number, label?: string) {
  if (!isAnalyticsEnabled()) {
    return
  }

  // Google Analytics
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- gtag is a global from external script
  if (typeof window !== 'undefined' && (window as any).gtag) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- gtag is a global from external script
    ;(window as any).gtag('event', 'timing_complete', {
      name: variable,
      value: Math.round(value),
      event_category: category,
      event_label: label,
    })
  }
}

/**
 * Initialize analytics on app load
 */
export function initAnalytics() {
  if (!isAnalyticsEnabled()) {
    console.log('[Analytics] Disabled in', process.env.NODE_ENV)
    return
  }

  console.log('[Analytics] Initialized')

  // Track initial page view
  if (typeof window !== 'undefined') {
    trackPageView({
      url: window.location.pathname,
      title: document.title,
      referrer: document.referrer,
    })
  }
}
