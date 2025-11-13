# Monitoring and Logging Implementation

This document describes the monitoring and logging infrastructure implemented for the Shaking Head News application.

## Overview

The application includes comprehensive monitoring and logging capabilities:

1. **Error Monitoring** - Sentry integration for error tracking
2. **Analytics** - Google Analytics and Vercel Analytics for user behavior tracking
3. **Performance Monitoring** - Web Vitals tracking for performance metrics
4. **Structured Logging** - Centralized logging system with multiple levels

## Components

### 1. Sentry Error Monitoring (`lib/sentry.ts`)

Sentry provides real-time error tracking and performance monitoring.

#### Features

- Automatic error capture and reporting
- Performance transaction tracking
- Session replay for debugging
- Breadcrumb tracking for context
- Sensitive data filtering
- Environment-aware configuration

#### Setup Instructions

1. **Install Sentry**
   ```bash
   npm install @sentry/nextjs
   ```

2. **Run Sentry Wizard**
   ```bash
   npx @sentry/wizard@latest -i nextjs
   ```

3. **Configure Environment Variables**
   ```bash
   # .env.local
   NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
   SENTRY_ORG=your-org
   SENTRY_PROJECT=your-project
   ```

4. **Enable Sentry Configuration**
   
   Uncomment the code in:
   - `sentry.client.config.ts` (client-side)
   - `sentry.server.config.ts` (server-side)
   - `sentry.edge.config.ts` (edge runtime)

#### Usage Examples

```typescript
import { captureException, captureMessage, setUser } from '@/lib/sentry'

// Capture an exception
try {
  // Some code that might throw
} catch (error) {
  captureException(error, { context: 'additional info' })
}

// Capture a message
captureMessage('Something important happened', 'info')

// Set user context
setUser({
  id: user.id,
  email: user.email,
  username: user.name
})
```

#### Configuration

The Sentry configuration includes:

- **Sample Rates**
  - Development: 100% of transactions
  - Production: 10% of transactions
  - Errors: 100% of sessions with errors

- **Filtered Data**
  - Cookies removed
  - Authorization headers removed
  - Browser extension errors ignored
  - Network errors filtered

### 2. Analytics Tracking (`lib/analytics.ts`)

Unified analytics interface supporting multiple platforms.

#### Supported Platforms

1. **Google Analytics (GA4)**
   - Page view tracking
   - Event tracking
   - User properties
   - Conversion tracking

2. **Vercel Analytics**
   - Automatic page view tracking
   - Custom event tracking
   - Built-in on Vercel platform

#### Setup Instructions

**For Google Analytics:**

1. **Get GA4 Measurement ID**
   - Go to https://analytics.google.com/
   - Create a new GA4 property
   - Copy the Measurement ID (G-XXXXXXXXXX)

2. **Add to Environment Variables**
   ```bash
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   ```

3. **Add GA Script to Layout**
   ```tsx
   // app/layout.tsx
   <Script
     src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
     strategy="afterInteractive"
   />
   <Script id="google-analytics" strategy="afterInteractive">
     {`
       window.dataLayer = window.dataLayer || [];
       function gtag(){dataLayer.push(arguments);}
       gtag('js', new Date());
       gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
     `}
   </Script>
   ```

**For Vercel Analytics:**

1. **Install Package**
   ```bash
   npm install @vercel/analytics
   ```

2. **Add to Layout**
   ```tsx
   // app/layout.tsx
   import { Analytics } from '@vercel/analytics/react'
   
   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <Analytics />
         </body>
       </html>
     )
   }
   ```

#### Usage Examples

```typescript
import {
  trackPageView,
  trackEvent,
  trackLogin,
  trackNewsRefresh,
  trackSettingsChange
} from '@/lib/analytics'

// Track page view
trackPageView({
  url: '/news',
  title: 'News Page'
})

// Track custom event
trackEvent({
  action: 'click',
  category: 'button',
  label: 'refresh',
  value: 1
})

// Track specific actions
trackLogin('google')
trackNewsRefresh('everydaynews')
trackSettingsChange('theme', 'dark')
```

#### Pre-built Tracking Functions

The analytics module includes pre-built functions for common events:

- `trackLogin(method)` - User login
- `trackLogout()` - User logout
- `trackNewsRefresh(source)` - News refresh
- `trackNewsClick(newsId, source)` - News item click
- `trackSettingsChange(setting, value)` - Settings change
- `trackRotation(angle, mode)` - Page rotation
- `trackRSSAction(action, sourceId)` - RSS management
- `trackLanguageChange(from, to)` - Language change
- `trackThemeChange(theme)` - Theme change
- `trackError(error, context)` - Error occurrence

### 3. Performance Monitoring (`lib/utils/performance.ts`)

Web Vitals tracking for performance metrics.

#### Tracked Metrics

- **LCP** (Largest Contentful Paint) - Loading performance
- **FID** (First Input Delay) - Interactivity
- **CLS** (Cumulative Layout Shift) - Visual stability
- **FCP** (First Contentful Paint) - Initial render
- **TTFB** (Time to First Byte) - Server response
- **INP** (Interaction to Next Paint) - Responsiveness

#### Setup

Performance monitoring is already configured in `app/web-vitals.tsx`:

```tsx
'use client'

import { useReportWebVitals } from 'next/web-vitals'
import { reportWebVitals } from '@/lib/utils/performance'

export function WebVitals() {
  useReportWebVitals((metric) => {
    reportWebVitals({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
    })
  })

  return null
}
```

#### Usage

The Web Vitals component is automatically included in the root layout and reports metrics to:
- Console (development)
- Google Analytics (production)
- Vercel Analytics (production)

### 4. Structured Logging (`lib/logger.ts`)

Centralized logging system with multiple levels and integrations.

#### Log Levels

- **debug** - Detailed debugging information (development only)
- **info** - General informational messages
- **warn** - Warning messages
- **error** - Error messages

#### Features

- Environment-aware logging
- Structured JSON output in production
- Sentry integration for errors
- Context-aware logging
- Performance measurement
- Module-specific loggers

#### Configuration

Configure via environment variables:

```bash
# Set minimum log level (debug, info, warn, error)
NEXT_PUBLIC_LOG_LEVEL=info
```

#### Usage Examples

```typescript
import { logger, createLogger, logExecutionTime } from '@/lib/logger'

// Basic logging
logger.debug('Debug message', { userId: '123' })
logger.info('User logged in', { userId: '123' })
logger.warn('Rate limit approaching', { remaining: 5 })
logger.error('Failed to fetch news', error, { source: 'api' })

// Specialized logging
logger.apiRequest('GET', '/api/news')
logger.apiResponse('GET', '/api/news', 200, 150)
logger.apiError('GET', '/api/news', error)
logger.userAction('refresh_news', { source: 'button' })
logger.auth('login', 'user-123')
logger.cache('hit', 'news:latest')
logger.performance('page_load', 1250, 'ms')

// Module-specific logger
const newsLogger = createLogger('news')
newsLogger.info('Fetching news', { source: 'api' })

// Measure execution time
const result = await logExecutionTime(
  'fetchNews',
  async () => {
    return await fetch('/api/news')
  },
  { source: 'api' }
)
```

#### Child Loggers

Create child loggers with default context:

```typescript
const userLogger = logger.child({ userId: '123', module: 'user' })

userLogger.info('Action performed') // Includes userId and module
```

## Integration Points

### Error Boundary Integration

```tsx
// components/ErrorBoundary.tsx
'use client'

import { useEffect } from 'react'
import { captureException } from '@/lib/sentry'
import { logger } from '@/lib/logger'

export function ErrorBoundary({ error, reset }) {
  useEffect(() => {
    // Log to both Sentry and logger
    captureException(error)
    logger.error('Error boundary caught error', error)
  }, [error])

  return (
    <div>
      <h2>Something went wrong</h2>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

### Server Action Integration

```typescript
// lib/actions/news.ts
'use server'

import { logger } from '@/lib/logger'
import { trackError } from '@/lib/analytics'

export async function getNews() {
  const newsLogger = logger.child({ action: 'getNews' })
  
  try {
    newsLogger.info('Fetching news')
    
    const response = await fetch('https://api.example.com/news')
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const data = await response.json()
    newsLogger.info('News fetched successfully', { count: data.length })
    
    return data
  } catch (error) {
    newsLogger.error('Failed to fetch news', error)
    trackError(error, 'getNews')
    throw error
  }
}
```

### Component Integration

```tsx
// components/news/RefreshButton.tsx
'use client'

import { trackNewsRefresh } from '@/lib/analytics'
import { logger } from '@/lib/logger'

export function RefreshButton() {
  const handleRefresh = async () => {
    logger.userAction('refresh_news')
    trackNewsRefresh()
    
    // Refresh logic...
  }
  
  return <button onClick={handleRefresh}>Refresh</button>
}
```

## Monitoring Dashboard

### Sentry Dashboard

Access at: https://sentry.io/

**Key Metrics:**
- Error rate and trends
- Performance metrics
- User impact
- Release tracking
- Issue assignment and resolution

### Google Analytics Dashboard

Access at: https://analytics.google.com/

**Key Reports:**
- Real-time users
- User demographics
- Behavior flow
- Event tracking
- Conversion tracking

### Vercel Analytics Dashboard

Access at: https://vercel.com/dashboard/analytics

**Key Metrics:**
- Page views
- Unique visitors
- Top pages
- Referrers
- Web Vitals scores

## Best Practices

### 1. Error Handling

```typescript
// ✅ Good: Log and track errors
try {
  await riskyOperation()
} catch (error) {
  logger.error('Operation failed', error, { context: 'important' })
  captureException(error, { context: 'important' })
  throw error
}

// ❌ Bad: Silent failures
try {
  await riskyOperation()
} catch (error) {
  // Nothing
}
```

### 2. Performance Tracking

```typescript
// ✅ Good: Track important operations
const result = await logExecutionTime('fetchNews', async () => {
  return await fetch('/api/news')
})

// ✅ Good: Track user interactions
trackEvent({
  action: 'click',
  category: 'news',
  label: 'article_123'
})
```

### 3. Context-Rich Logging

```typescript
// ✅ Good: Include context
logger.info('User updated settings', {
  userId: user.id,
  changes: ['theme', 'language'],
  timestamp: Date.now()
})

// ❌ Bad: No context
logger.info('Settings updated')
```

### 4. Sensitive Data

```typescript
// ✅ Good: Filter sensitive data
logger.info('User logged in', {
  userId: user.id,
  // Don't log: password, tokens, etc.
})

// ❌ Bad: Logging sensitive data
logger.info('User logged in', {
  userId: user.id,
  password: user.password // Never do this!
})
```

## Performance Targets

Based on requirement 10.1, the application should meet these targets:

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **TTI** (Time to Interactive): < 3.5s

These metrics are automatically tracked and reported to analytics platforms.

## Troubleshooting

### Sentry Not Capturing Errors

1. Check that `NEXT_PUBLIC_SENTRY_DSN` is set
2. Verify Sentry configuration files are uncommented
3. Check browser console for Sentry initialization messages
4. Ensure errors are not filtered by `ignoreErrors` configuration

### Analytics Not Tracking

1. Verify `NEXT_PUBLIC_GA_ID` is set correctly
2. Check that GA script is loaded in browser DevTools
3. Ensure ad blockers are not blocking analytics
4. Check browser console for analytics errors

### Logs Not Appearing

1. Check `NEXT_PUBLIC_LOG_LEVEL` environment variable
2. Verify log level is appropriate (debug < info < warn < error)
3. Check browser console settings (filters)
4. Ensure structured logging is working in production

## Future Enhancements

Potential improvements for the monitoring system:

1. **Custom Dashboards**
   - Create custom Grafana/Datadog dashboards
   - Real-time monitoring alerts
   - Custom metric aggregation

2. **Log Aggregation**
   - Integrate with LogRocket or similar
   - Centralized log storage
   - Advanced log search and filtering

3. **APM Integration**
   - Application Performance Monitoring
   - Distributed tracing
   - Database query monitoring

4. **User Session Recording**
   - Full session replay
   - Heatmaps and click tracking
   - User journey analysis

## Summary

The monitoring and logging infrastructure provides:

✅ **Error Tracking** - Sentry integration for production error monitoring
✅ **Analytics** - Google Analytics and Vercel Analytics for user behavior
✅ **Performance** - Web Vitals tracking for performance metrics
✅ **Logging** - Structured logging with multiple levels and integrations

All components are production-ready and can be enabled by setting the appropriate environment variables.
