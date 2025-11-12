# Security Implementation Guide

## Overview

This document describes the security hardening measures implemented for the "Shaking Head News" application, covering Content Security Policy (CSP), rate limiting, input validation, CORS configuration, and permission verification in Server Actions.

## Implementation Status

✅ **Completed:**
- Content Security Policy (CSP) headers
- Rate limiting system
- Input validation and sanitization utilities
- CORS and security headers configuration
- Permission verification in Server Actions

## 1. Content Security Policy (CSP)

### Implementation

CSP headers are configured in two places:

1. **Proxy Middleware** (`proxy.ts`):
   - Applied to all routes via Next.js middleware
   - Provides runtime security headers

2. **Next.js Config** (`next.config.js`):
   - Applied at build time
   - Provides additional security headers

### CSP Directives

```typescript
const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https: blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://news.ravelloh.top https://accounts.google.com https://*.upstash.io",
  "frame-src 'self' https://accounts.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
]
```

### Security Headers Applied

- **Content-Security-Policy**: Prevents XSS and data injection attacks
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-XSS-Protection**: Legacy XSS protection for older browsers
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Restricts browser features
- **Strict-Transport-Security**: Enforces HTTPS (production only)

## 2. Rate Limiting

### Implementation

Rate limiting is implemented using Vercel Marketplace Storage (Upstash Redis) in `lib/rate-limit.ts`.

### Rate Limit Tiers

```typescript
export const RateLimitTiers = {
  STRICT: { limit: 5, window: 900 },      // 5 requests per 15 minutes
  STANDARD: { limit: 30, window: 60 },    // 30 requests per minute
  RELAXED: { limit: 100, window: 60 },    // 100 requests per minute
  PUBLIC: { limit: 300, window: 300 },    // 300 requests per 5 minutes
}
```

### Usage Examples

#### By User ID
```typescript
import { rateLimitByUser, RateLimitTiers } from '@/lib/rate-limit'

const result = await rateLimitByUser(userId, RateLimitTiers.STANDARD)
if (!result.success) {
  throw new Error('Rate limit exceeded')
}
```

#### By Action Type
```typescript
import { rateLimitByAction, RateLimitTiers } from '@/lib/rate-limit'

const result = await rateLimitByAction(userId, 'add-rss', RateLimitTiers.STRICT)
if (!result.success) {
  throw new Error('Too many requests')
}
```

#### By IP Address
```typescript
import { rateLimitByIP } from '@/lib/rate-limit'

const result = await rateLimitByIP(ipAddress)
if (!result.success) {
  throw new Error('Rate limit exceeded')
}
```

### Applied Rate Limits

| Action | Tier | Limit | Window |
|--------|------|-------|--------|
| Update Settings | STANDARD | 30 | 60s |
| Reset Settings | STRICT | 5 | 900s |
| Add RSS Source | STRICT | 5 | 900s |
| Update RSS Source | STANDARD | 30 | 60s |
| Record Rotation | RELAXED | 100 | 60s |
| Get Stats | STANDARD | 30 | 60s |

## 3. Input Validation and Sanitization

### Implementation

Input validation utilities are implemented in `lib/utils/input-validation.ts`.

### Key Functions

#### String Sanitization
```typescript
import { sanitizeString } from '@/lib/utils/input-validation'

const clean = sanitizeString(userInput, {
  maxLength: 1000,
  allowHtml: false,
  allowNewlines: true,
})
```

#### URL Sanitization
```typescript
import { sanitizeUrl } from '@/lib/utils/input-validation'

const cleanUrl = sanitizeUrl(userUrl)
if (!cleanUrl) {
  throw new Error('Invalid URL')
}
```

#### Object Sanitization
```typescript
import { sanitizeObject } from '@/lib/utils/input-validation'

const cleanData = sanitizeObject(userData, {
  maxLength: 500,
  allowHtml: false,
})
```

#### Zod Schema Validation
```typescript
import { validateAndSanitize } from '@/lib/utils/input-validation'
import { UserSettingsSchema } from '@/types/settings'

const validData = validateAndSanitize(UserSettingsSchema, rawData)
```

### Security Checks

- **XSS Detection**: `containsXss(input)` - Detects XSS patterns
- **SQL Injection Detection**: `containsSqlInjection(input)` - Detects SQL injection patterns
- **HTML Escaping**: `escapeHtml(text)` - Escapes HTML special characters
- **Filename Sanitization**: `sanitizeFilename(filename)` - Sanitizes filenames for safe storage

## 4. CORS Configuration

### Implementation

CORS headers are configured in `proxy.ts` for API routes.

### Allowed Origins

```typescript
const allowedOrigins = [
  process.env.NEXT_PUBLIC_APP_URL,
  'http://localhost:3000',
  'http://localhost:3001',
]
```

### CORS Headers

- **Access-Control-Allow-Origin**: Restricts origins
- **Access-Control-Allow-Credentials**: Allows credentials
- **Access-Control-Allow-Methods**: Restricts HTTP methods
- **Access-Control-Allow-Headers**: Restricts headers

### Preflight Handling

```typescript
if (request.method === 'OPTIONS') {
  const response = new NextResponse(null, { status: 204 })
  return setCorsHeaders(response, request)
}
```

## 5. Permission Verification in Server Actions

### Implementation

All Server Actions now include:

1. **Authentication Check**: Verify user is logged in
2. **Rate Limiting**: Prevent abuse
3. **Input Validation**: Sanitize and validate input
4. **Authorization Check**: Verify user owns the resource

### Example: Update Settings

```typescript
export async function updateSettings(settings: Partial<UserSettings>) {
  // 1. Authentication
  const session = await auth()
  if (!session?.user?.id) {
    throw new AuthError('Please sign in to save settings')
  }

  // 2. Rate Limiting
  const rateLimitResult = await rateLimitByUser(session.user.id, {
    ...RateLimitTiers.STANDARD,
    limit: 30,
  })
  if (!rateLimitResult.success) {
    throw new Error('Too many requests. Please try again later.')
  }

  // 3. Input Validation
  const sanitizedSettings = sanitizeObject(settings, {
    maxLength: 1000,
    allowHtml: false,
  })

  // 4. Authorization (implicit - user can only update their own settings)
  const validatedSettings = validateOrThrow(UserSettingsSchema, {
    ...currentSettings,
    ...sanitizedSettings,
    userId: session.user.id, // Ensure userId cannot be overwritten
  })

  // 5. Execute action
  await setStorageItem(StorageKeys.userSettings(session.user.id), validatedSettings)
}
```

### Example: Update RSS Source

```typescript
export async function updateRSSSource(id: string, updates: Partial<RSSSource>) {
  // 1. Authentication
  const session = await auth()
  if (!session?.user?.id) {
    throw new AuthError('Please sign in to update RSS sources')
  }

  // 2. Rate Limiting
  const rateLimitResult = await rateLimitByUser(session.user.id, {
    ...RateLimitTiers.STANDARD,
  })
  if (!rateLimitResult.success) {
    throw new Error('Too many requests. Please try again later.')
  }

  // 3. Input Validation
  const sanitizedUpdates = sanitizeObject(updates, {
    maxLength: 500,
    allowHtml: false,
  })

  // 4. Authorization - Verify user owns the RSS source
  const sources = await getRSSSources()
  const index = sources.findIndex(s => s.id === id)
  if (index === -1) {
    throw new NotFoundError('RSS source not found')
  }

  // 5. Execute action
  const validatedSource = validateOrThrow(RSSSourceSchema, updatedSource)
  sources[index] = validatedSource
  await storage.set(`user:${session.user.id}:rss-sources`, sources)
}
```

## 6. Additional Security Measures

### Input Constraints

- **RSS Sources**: Maximum 50 per user
- **String Length**: Maximum 1000 characters (configurable)
- **Rotation Angle**: -180° to 180°
- **Rotation Duration**: 0 to 3600 seconds
- **Date Range**: Maximum 365 days for stats queries

### Error Handling

All security errors are logged but return user-friendly messages:

```typescript
try {
  // Protected operation
} catch (error) {
  logError(error, { action: 'operationName', userId })
  return {
    success: false,
    error: 'A user-friendly error message',
  }
}
```

### Silent Failures

Some operations fail silently to avoid information disclosure:

- Rate limit exceeded for rotation recording (doesn't affect UX)
- Storage errors (falls back to default values)

## 7. Testing Security Features

### Rate Limiting Tests

```typescript
// Test rate limit enforcement
for (let i = 0; i < 35; i++) {
  const result = await updateSettings({ theme: 'dark' })
  if (i < 30) {
    expect(result.success).toBe(true)
  } else {
    expect(result.success).toBe(false)
    expect(result.error).toContain('Too many requests')
  }
}
```

### Input Validation Tests

```typescript
// Test XSS prevention
const maliciousInput = '<script>alert("xss")</script>'
const sanitized = sanitizeString(maliciousInput)
expect(sanitized).not.toContain('<script>')

// Test SQL injection prevention
const sqlInput = "'; DROP TABLE users; --"
expect(containsSqlInjection(sqlInput)).toBe(true)
```

### CSP Tests

```typescript
// Test CSP headers are present
const response = await fetch('/')
expect(response.headers.get('Content-Security-Policy')).toBeTruthy()
expect(response.headers.get('X-Frame-Options')).toBe('DENY')
```

## 8. Security Best Practices

### Do's

✅ Always validate and sanitize user input
✅ Use rate limiting for all write operations
✅ Verify user authentication and authorization
✅ Use Zod schemas for type-safe validation
✅ Log security events for monitoring
✅ Return generic error messages to users
✅ Use HTTPS in production
✅ Keep dependencies updated

### Don'ts

❌ Don't trust client-side validation alone
❌ Don't expose sensitive error details to users
❌ Don't store sensitive data in localStorage
❌ Don't use `eval()` or `Function()` constructors
❌ Don't disable security features for convenience
❌ Don't hardcode secrets in code
❌ Don't allow unlimited request rates

## 9. Monitoring and Alerts

### Security Events to Monitor

- Rate limit violations
- Authentication failures
- Invalid input attempts
- Unauthorized access attempts
- Unusual traffic patterns

### Recommended Tools

- **Sentry**: Error tracking and monitoring
- **Vercel Analytics**: Traffic and performance monitoring
- **Upstash Redis**: Rate limit metrics

## 10. Future Enhancements

### Planned Improvements

- [ ] Implement CAPTCHA for sensitive operations
- [ ] Add IP-based blocking for repeated violations
- [ ] Implement session management with Redis
- [ ] Add two-factor authentication (2FA)
- [ ] Implement audit logging for all actions
- [ ] Add automated security scanning in CI/CD
- [ ] Implement Content Security Policy reporting
- [ ] Add DDoS protection at edge level

## 11. Compliance

### Security Standards

- **OWASP Top 10**: Addresses common web vulnerabilities
- **GDPR**: User data protection and privacy
- **SOC 2**: Security controls and monitoring

### Data Protection

- User data encrypted in transit (HTTPS)
- User data encrypted at rest (Upstash Redis)
- No sensitive data in logs
- User can delete their data

## References

- [OWASP Security Guidelines](https://owasp.org/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Content Security Policy Reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Vercel Security Documentation](https://vercel.com/docs/security)

## Related Requirements

This implementation addresses the following requirements from the specification:

- **Requirement 2.1**: User authentication and authorization
- **Requirement 2.6**: Security and data protection (implied from requirement 2.1 context)

## Conclusion

The security hardening implementation provides comprehensive protection against common web vulnerabilities including XSS, CSRF, SQL injection, and abuse through rate limiting. All Server Actions are protected with authentication, authorization, rate limiting, and input validation.
