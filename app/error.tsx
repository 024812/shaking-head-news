'use client'

import { ErrorBoundary } from '@/components/ErrorBoundary'

/**
 * Root error page for the application
 * Catches errors in the app directory
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ErrorBoundary error={error} reset={reset} />
}
