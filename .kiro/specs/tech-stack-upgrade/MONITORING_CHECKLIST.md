# Monitoring and Logging Setup Checklist

Use this checklist to verify your monitoring and logging setup is complete and working correctly.

## 📋 Pre-Setup Checklist

- [ ] Node.js 20+ installed
- [ ] Project dependencies installed (`npm install`)
- [ ] `.env.local` file created from `.env.example`
- [ ] Application runs successfully (`npm run dev`)

## 🔧 Setup Checklist

### Sentry Error Monitoring (Optional)

- [ ] Run setup script: `.\scripts\setup-monitoring.ps1`
- [ ] Install Sentry: `npm install @sentry/nextjs`
- [ ] Run Sentry wizard: `npx @sentry/wizard@latest -i nextjs`
- [ ] Add `NEXT_PUBLIC_SENTRY_DSN` to `.env.local`
- [ ] Uncomment code in `sentry.client.config.ts`
- [ ] Uncomment code in `sentry.server.config.ts`
- [ ] Uncomment code in `sentry.edge.config.ts`
- [ ] Verify Sentry project created at https://sentry.io/

### Google Analytics (Optional)

- [ ] Create GA4 property at https://analytics.google.com/
- [ ] Copy Measurement ID (G-XXXXXXXXXX)
- [ ] Add `NEXT_PUBLIC_GA_ID` to `.env.local`
- [ ] Add GA script to `app/layout.tsx` (see documentation)
- [ ] Verify GA is receiving data in Real-Time view

### Vercel Analytics (Optional)

- [ ] Install package: `npm install @vercel/analytics`
- [ ] Add `<Analytics />` component to `app/layout.tsx`
- [ ] Deploy to Vercel
- [ ] Enable Analytics in Vercel dashboard
- [ ] Verify analytics data in Vercel dashboard

### Vercel Speed Insights (Optional)

- [ ] Install package: `npm install @vercel/speed-insights`
- [ ] Add `<SpeedInsights />` component to `app/layout.tsx`
- [ ] Deploy to Vercel
- [ ] Enable Speed Insights in Vercel dashboard
- [ ] Verify metrics in Vercel dashboard

## ✅ Verification Checklist

### Development Environment

- [ ] Start dev server: `npm run dev`
- [ ] Open browser console
- [ ] Verify logs appear in console
- [ ] Check for Sentry initialization message (if enabled)
- [ ] Check for Analytics initialization message (if enabled)
- [ ] Trigger a test error and verify it's logged
- [ ] Check Web Vitals are being reported

### Test Error Tracking

Create a test file `test-monitoring.ts`:

```typescript
import { captureException, captureMessage } from '@/lib/sentry'
import { trackEvent } from '@/lib/analytics'
import { logger } from '@/lib/logger'

// Test Sentry
captureMessage('Test message from development', 'info')

// Test Analytics
trackEvent({
  action: 'test',
  category: 'monitoring',
  label: 'setup_verification'
})

// Test Logger
logger.info('Test log message', { test: true })
logger.error('Test error message', new Error('Test error'))
```

- [ ] Run test file
- [ ] Check browser console for logs
- [ ] Check Sentry dashboard for test message (if enabled)
- [ ] Check GA Real-Time view for test event (if enabled)

### Test in Components

Add test code to a component:

```typescript
'use client'

import { trackEvent } from '@/lib/analytics'
import { logger } from '@/lib/logger'

export function TestButton() {
  const handleClick = () => {
    logger.userAction('test_button_click')
    trackEvent({
      action: 'click',
      category: 'test',
      label: 'test_button'
    })
  }
  
  return <button onClick={handleClick}>Test Monitoring</button>
}
```

- [ ] Add TestButton to a page
- [ ] Click the button
- [ ] Verify log in console
- [ ] Verify event in GA Real-Time (if enabled)

### Production Environment

- [ ] Set environment variables in Vercel
- [ ] Deploy to production
- [ ] Visit production site
- [ ] Trigger some user actions
- [ ] Wait 5-10 minutes for data to appear
- [ ] Check Sentry dashboard for any errors
- [ ] Check GA dashboard for page views and events
- [ ] Check Vercel Analytics dashboard
- [ ] Verify Web Vitals are being tracked

## 🔍 Monitoring Dashboard Checklist

### Sentry Dashboard

- [ ] Access https://sentry.io/
- [ ] Navigate to your project
- [ ] Check "Issues" tab for errors
- [ ] Check "Performance" tab for transactions
- [ ] Check "Releases" tab for deployments
- [ ] Set up alerts for critical errors

### Google Analytics Dashboard

- [ ] Access https://analytics.google.com/
- [ ] Navigate to your property
- [ ] Check "Real-time" for live users
- [ ] Check "Events" for custom events
- [ ] Check "Pages and screens" for page views
- [ ] Set up custom reports

### Vercel Analytics Dashboard

- [ ] Access https://vercel.com/dashboard
- [ ] Navigate to your project
- [ ] Click "Analytics" tab
- [ ] Check page views and visitors
- [ ] Check Web Vitals scores
- [ ] Review top pages and referrers

## 📊 Performance Targets Checklist

Verify your application meets these targets:

- [ ] **LCP** (Largest Contentful Paint): < 2.5s
- [ ] **FID** (First Input Delay): < 100ms
- [ ] **CLS** (Cumulative Layout Shift): < 0.1
- [ ] **TTI** (Time to Interactive): < 3.5s

Check these in:
- Chrome DevTools Lighthouse
- Vercel Speed Insights
- Google PageSpeed Insights

## 🔒 Security Checklist

- [ ] Sensitive data is filtered from error reports
- [ ] No passwords or tokens in logs
- [ ] No PII (Personally Identifiable Information) in analytics
- [ ] CSP headers configured correctly
- [ ] Rate limiting is working
- [ ] CORS is configured properly

## 📚 Documentation Checklist

- [ ] Read [MONITORING_AND_LOGGING.md](.kiro/specs/tech-stack-upgrade/MONITORING_AND_LOGGING.md)
- [ ] Read [MONITORING_QUICK_START.md](../../docs/MONITORING_QUICK_START.md)
- [ ] Bookmark monitoring dashboards
- [ ] Share documentation with team
- [ ] Set up alerts and notifications

## 🚨 Troubleshooting Checklist

If something isn't working:

### Sentry Not Working

- [ ] Check `NEXT_PUBLIC_SENTRY_DSN` is set correctly
- [ ] Verify Sentry config files are uncommented
- [ ] Check browser console for Sentry errors
- [ ] Verify Sentry project exists and is active
- [ ] Check network tab for Sentry requests
- [ ] Try clearing browser cache

### Analytics Not Tracking

- [ ] Check `NEXT_PUBLIC_GA_ID` is set correctly
- [ ] Verify GA script is in `app/layout.tsx`
- [ ] Disable ad blockers
- [ ] Check browser console for GA errors
- [ ] Verify GA property is active
- [ ] Wait 24-48 hours for data to appear in reports

### Logs Not Appearing

- [ ] Check `NEXT_PUBLIC_LOG_LEVEL` setting
- [ ] Verify log level is appropriate (debug < info < warn < error)
- [ ] Check browser console filters
- [ ] Verify logger is imported correctly
- [ ] Check for JavaScript errors

### Web Vitals Not Tracking

- [ ] Verify `app/web-vitals.tsx` is included in layout
- [ ] Check browser console for Web Vitals data
- [ ] Verify performance API is available
- [ ] Check network tab for analytics requests
- [ ] Test in production environment

## ✨ Best Practices Checklist

- [ ] Log errors with context
- [ ] Track important user actions
- [ ] Use appropriate log levels
- [ ] Never log sensitive data
- [ ] Add context to logs
- [ ] Test monitoring before deploying
- [ ] Set up alerts for critical errors
- [ ] Review monitoring data regularly
- [ ] Document custom events
- [ ] Train team on monitoring tools

## 🎯 Next Steps

After completing this checklist:

1. [ ] Monitor application for 1 week
2. [ ] Review error patterns in Sentry
3. [ ] Analyze user behavior in GA
4. [ ] Optimize based on Web Vitals data
5. [ ] Set up custom alerts
6. [ ] Create custom dashboards
7. [ ] Document any issues found
8. [ ] Share insights with team

## 📝 Notes

Use this space to document any issues or customizations:

```
Date: ___________
Issue: ___________
Resolution: ___________

Date: ___________
Customization: ___________
Reason: ___________
```

## ✅ Sign-off

- [ ] All monitoring tools are set up
- [ ] All verification tests passed
- [ ] Documentation reviewed
- [ ] Team trained on monitoring tools
- [ ] Alerts configured
- [ ] Ready for production

**Completed by**: ___________
**Date**: ___________
**Signature**: ___________

---

## 📞 Support

If you need help:

1. Check the documentation:
   - [MONITORING_AND_LOGGING.md](.kiro/specs/tech-stack-upgrade/MONITORING_AND_LOGGING.md)
   - [MONITORING_QUICK_START.md](../../docs/MONITORING_QUICK_START.md)

2. Check platform documentation:
   - [Sentry Docs](https://docs.sentry.io/)
   - [Google Analytics Docs](https://developers.google.com/analytics)
   - [Vercel Analytics Docs](https://vercel.com/docs/analytics)

3. Contact support:
   - Sentry: https://sentry.io/support/
   - Google Analytics: https://support.google.com/analytics/
   - Vercel: https://vercel.com/support

---

**Last Updated**: 2025-01-13
**Version**: 1.0.0
