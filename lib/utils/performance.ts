/**
 * Performance monitoring utilities for Web Vitals and custom metrics
 */

export interface PerformanceMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta?: number
  id?: string
}

/**
 * Report Web Vitals to analytics
 * This can be integrated with Google Analytics, Vercel Analytics, or custom analytics
 */
export function reportWebVitals(metric: PerformanceMetric) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Web Vitals]', metric)
  }

  // Send to analytics in production
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to Google Analytics
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- gtag is a global from external script
    if (typeof window !== 'undefined' && (window as any).gtag) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- gtag is a global from external script
      ;(window as any).gtag('event', metric.name, {
        value: Math.round(metric.value),
        metric_id: metric.id,
        metric_value: metric.value,
        metric_delta: metric.delta,
        metric_rating: metric.rating,
      })
    }

    // Example: Send to Vercel Analytics
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- va is a global from external script
    if (typeof window !== 'undefined' && (window as any).va) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- va is a global from external script
      ;(window as any).va('event', {
        name: metric.name,
        data: {
          value: metric.value,
          rating: metric.rating,
        },
      })
    }
  }
}

/**
 * Measure custom performance metrics
 */
export function measurePerformance(name: string, fn: () => void | Promise<void>) {
  const start = performance.now()

  const finish = () => {
    const duration = performance.now() - start
    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`)
  }

  try {
    const result = fn()
    if (result instanceof Promise) {
      return result.finally(finish)
    }
    finish()
    return result
  } catch (error) {
    finish()
    throw error
  }
}

/**
 * Get performance rating based on thresholds
 */
export function getPerformanceRating(
  metric: string,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const thresholds: Record<string, [number, number]> = {
    LCP: [2500, 4000], // Largest Contentful Paint
    FID: [100, 300], // First Input Delay
    CLS: [0.1, 0.25], // Cumulative Layout Shift
    FCP: [1800, 3000], // First Contentful Paint
    TTFB: [800, 1800], // Time to First Byte
    INP: [200, 500], // Interaction to Next Paint
  }

  const [good, poor] = thresholds[metric] || [0, 0]

  if (value <= good) return 'good'
  if (value <= poor) return 'needs-improvement'
  return 'poor'
}

/**
 * Check if the browser supports Performance Observer
 */
export function supportsPerformanceObserver(): boolean {
  return (
    typeof window !== 'undefined' && 'PerformanceObserver' in window && 'PerformanceEntry' in window
  )
}

/**
 * Observe long tasks (tasks that block the main thread for > 50ms)
 */
export function observeLongTasks(callback: (entries: PerformanceEntry[]) => void) {
  if (!supportsPerformanceObserver()) return

  try {
    const observer = new PerformanceObserver((list) => {
      callback(list.getEntries())
    })

    observer.observe({ entryTypes: ['longtask'] })

    return () => observer.disconnect()
  } catch (error) {
    console.warn('Failed to observe long tasks:', error)
  }
}

/**
 * Observe resource loading performance
 */
export function observeResourceTiming(callback: (entries: PerformanceEntry[]) => void) {
  if (!supportsPerformanceObserver()) return

  try {
    const observer = new PerformanceObserver((list) => {
      callback(list.getEntries())
    })

    observer.observe({ entryTypes: ['resource'] })

    return () => observer.disconnect()
  } catch (error) {
    console.warn('Failed to observe resource timing:', error)
  }
}
