# Environment Variables Reference

Last Updated: 2026-01-26
Status: Production Configuration

The following environment variables are confirmed necessary and correctly configured for `sn.oheng.com`.

## Authentication (NextAuth.js)

| Variable                            | Description                                 |
| ----------------------------------- | ------------------------------------------- |
| `NEXTAUTH_SECRET`                   | Encryption key for session tokens.          |
| `GOOGLE_CLIENT_ID`                  | Google OAuth Client ID.                     |
| `GOOGLE_CLIENT_SECRET`              | Google OAuth Client Secret.                 |
| `AUTH_MICROSOFT_ENTRA_ID_ID`        | Microsoft Entra ID Application (Client) ID. |
| `AUTH_MICROSOFT_ENTRA_ID_SECRET`    | Microsoft Entra ID Client Secret.           |
| `AUTH_MICROSOFT_ENTRA_ID_TENANT_ID` | Tenant ID (or `common` for multi-tenant).   |

## Database (Upstash Redis)

| Variable                   | Description                                |
| -------------------------- | ------------------------------------------ |
| `UPSTASH_REDIS_REST_URL`   | REST API URL for Upstash Redis connection. |
| `UPSTASH_REDIS_REST_TOKEN` | Authentication token for Upstash Redis.    |

> **Note**: `REDIS_URL` is present in Vercel but unused by the application code (`lib/storage.ts` uses the `UPSTASH_` variants). It can be safely ignored.

## Integrations

| Variable                        | Description                                                         |
| ------------------------------- | ------------------------------------------------------------------- |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | Google AdSense Publisher ID (e.g., `ca-pub-xxx`). Required for ads. |
| `NEWS_API_BASE_URL`             | Base URL for the external news provider API.                        |

## Deprecated / Removed

The following variables have been removed as they are not used by the current codebase:

- `NEXTAUTH_URL` (Removed to support multi-domain dynamic redirect)
- `KV_URL`
- `KV_REST_API_READ_ONLY_TOKEN`
- `KV_REST_API_TOKEN`
- `KV_REST_API_URL`
