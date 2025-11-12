# Deployment Checklist

Quick reference checklist for deploying Shaking Head News to Vercel.

## Pre-Deployment

### 1. Code Quality

- [ ] All tests pass: `npm run test` (if tests exist)
- [ ] No TypeScript errors: `npm run type-check`
- [ ] No linting errors: `npm run lint`
- [ ] Build succeeds locally: `npm run build`

### 2. Environment Setup

- [ ] Created Vercel account
- [ ] Repository connected to Vercel
- [ ] Google OAuth credentials created
- [ ] Upstash Redis database created

### 3. Environment Variables

- [ ] `NEXTAUTH_SECRET` generated (use: `openssl rand -base64 32`)
- [ ] `NEXTAUTH_URL` set to production URL
- [ ] `GOOGLE_CLIENT_ID` configured
- [ ] `GOOGLE_CLIENT_SECRET` configured
- [ ] `UPSTASH_REDIS_REST_URL` configured
- [ ] `UPSTASH_REDIS_REST_TOKEN` configured
- [ ] `NEXT_PUBLIC_APP_URL` set to production URL
- [ ] `NEWS_API_BASE_URL` configured

### 4. OAuth Configuration

- [ ] Google OAuth redirect URIs include production URL
- [ ] Google OAuth redirect URIs include preview URL (optional)
- [ ] OAuth consent screen configured
- [ ] Test users added (if in testing mode)

## Deployment

### 5. Vercel Project Setup

- [ ] Project imported from GitHub
- [ ] Framework preset: Next.js
- [ ] Build command: `npm run build`
- [ ] Output directory: `.next`
- [ ] Install command: `npm install`

### 6. Region Configuration

- [ ] Using Vercel Hobby plan (US regions automatically assigned)
- [ ] Or Pro plan with custom regions configured (optional)

### 7. Deploy

- [ ] Initial deployment triggered
- [ ] Build completed successfully
- [ ] Deployment URL received

## Post-Deployment

### 8. Verification

- [ ] Homepage loads: `https://your-domain.vercel.app/`
- [ ] Login page accessible: `https://your-domain.vercel.app/login`
- [ ] Google OAuth flow works
- [ ] User can sign in successfully
- [ ] Settings save correctly
- [ ] News data loads
- [ ] Page rotation works
- [ ] Theme toggle works
- [ ] Language switch works

### 9. Performance

- [ ] Lighthouse score > 90
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Images load correctly
- [ ] ISR caching works

### 10. Security

- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Security headers present (check DevTools)
- [ ] CSP headers configured
- [ ] Rate limiting works
- [ ] No sensitive data in client-side code
- [ ] Environment variables not exposed

### 11. Monitoring (Optional)

- [ ] Vercel Analytics enabled
- [ ] Vercel Speed Insights enabled
- [ ] Error monitoring configured (Sentry, etc.)
- [ ] Upstash Redis monitoring checked

### 12. Custom Domain (Optional)

- [ ] Domain added in Vercel
- [ ] DNS records configured
- [ ] SSL certificate issued
- [ ] `NEXTAUTH_URL` updated
- [ ] `NEXT_PUBLIC_APP_URL` updated
- [ ] Google OAuth redirect URIs updated

## Maintenance

### Regular Tasks

- [ ] Monitor Vercel Analytics weekly
- [ ] Check Upstash Redis usage weekly
- [ ] Review error logs weekly
- [ ] Update dependencies monthly
- [ ] Rotate secrets quarterly
- [ ] Review and optimize performance quarterly

## Rollback Plan

If issues occur:

1. Go to Vercel Dashboard > Deployments
2. Find last working deployment
3. Click "Promote to Production"
4. Investigate issues in preview environment

## Support Contacts

- **Vercel Support**: support@vercel.com
- **Upstash Support**: support@upstash.com
- **Project Issues**: [GitHub Issues](https://github.com/024812/shaking-head-news/issues)

## Quick Commands

```bash
# Local development
npm run dev

# Type check
npm run type-check

# Lint
npm run lint

# Build
npm run build

# Start production server locally
npm run start

# Analyze bundle
npm run build:analyze
```

## Environment Variable Template

```bash
# Copy to Vercel Environment Variables
NEXTAUTH_SECRET=<generate-with-openssl>
NEXTAUTH_URL=https://your-domain.vercel.app
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>
UPSTASH_REDIS_REST_URL=<your-redis-url>
UPSTASH_REDIS_REST_TOKEN=<your-redis-token>
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEWS_API_BASE_URL=https://news.ravelloh.top
```

---

**Last Updated**: 2025-01-12

✅ = Completed | ⏳ = In Progress | ❌ = Blocked
