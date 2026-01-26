---
description: Critical rules and conventions for Next.js 16 development
---

# Next.js 16 Critical Conventions

This workflow documents strict rules for Next.js 16 development to prevent regression errors.

## 1. Middleware vs Proxy

**RULE: NEVER rename `proxy.ts` to `middleware.ts`.**

In Next.js 16:

- The `middleware` filename is **DEPRECATED**.
- The correct filename is **`proxy.ts`**.
- The named export must be `proxy`, not `middleware`.
- `proxy.ts` runs on the Node.js runtime (Edge runtime is NOT supported in proxy).

**Incorrect:**

```typescript
// middleware.ts
export function middleware(request: NextRequest) { ... }
```

**Correct:**

```typescript
// proxy.ts
export function proxy(request: NextRequest) { ... }
```

## 2. Server Actions & Auth

When using `auth()` from NextAuth v5 in Server Actions:

- Ensure the session cookie is correctly passed.
- If `auth()` returns null, check for `UNAUTHORIZED` or `RATE_LIMIT` errors explicitly.

## 3. Checklist for "Middleware" Tasks

If asked to "edit middleware":

1. [ ] Edit `proxy.ts`.
2. [ ] DO NOT create `middleware.ts`.
3. [ ] DO NOT rename `proxy.ts`.
