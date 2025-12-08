'use client'

import { ErrorBoundary } from '@/components/ErrorBoundary'

/**
 * Error page for main route group
 * Catches errors in the (main) directory
 */
export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ErrorBoundary error={error} reset={reset} />
}
