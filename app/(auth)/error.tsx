'use client'

import { ErrorBoundary } from '@/components/ErrorBoundary'

/**
 * Error page for auth route group
 * Catches errors in the (auth) directory
 */
export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ErrorBoundary error={error} reset={reset} />
}
