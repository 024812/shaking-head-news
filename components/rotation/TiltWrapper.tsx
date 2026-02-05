'use client'

import { useRotationStore } from '@/lib/stores/rotation-store'
import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { recordRotation } from '@/lib/actions/stats'
import { cn } from '@/lib/utils'

interface TiltWrapperProps {
  children: React.ReactNode
  mode?: 'fixed' | 'continuous'
  interval?: number
}

export function TiltWrapper({
  children,
  mode: propMode,
  interval: _propInterval,
}: TiltWrapperProps) {
  const { isPaused, mode, setAngle } = useRotationStore()
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const lastRotationTime = useRef<number>(Date.now())
  const pathname = usePathname()

  // Use props if provided, otherwise use store values
  const effectiveMode = propMode ?? mode

  // Disable rotation on settings and RSS pages
  const isSettingsPage = pathname === '/settings' || pathname === '/rss'

  // Manually rehydrate zustand store after mount (SSR fix from context7)
  useEffect(() => {
    useRotationStore.persist.rehydrate()
    setIsHydrated(true)
  }, [])

  // Check for prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleChange = (e: any) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Reset angle to 0 on settings page
  useEffect(() => {
    if (isSettingsPage) {
      setAngle(0)
    }
  }, [isSettingsPage, setAngle])

  // Record rotation stats periodically (for CSS animation, we track time spent)
  useEffect(() => {
    if (!isHydrated) return
    if (isPaused || prefersReducedMotion || isSettingsPage) return

    // Record rotation every 20 seconds (one animation cycle)
    const timer = setInterval(() => {
      const now = Date.now()
      const duration = Math.round((now - lastRotationTime.current) / 1000)
      lastRotationTime.current = now

      // Record with average angle since CSS animation varies
      recordRotation(10, duration).catch(() => {
        // Silent failure
      })
    }, 20000)

    return () => clearInterval(timer)
  }, [isHydrated, isPaused, prefersReducedMotion, isSettingsPage])

  // Determine if animation should be active
  const shouldAnimate =
    isHydrated &&
    !isPaused &&
    !prefersReducedMotion &&
    !isSettingsPage &&
    effectiveMode === 'continuous'

  return (
    <div
      className={cn(
        'h-screen overflow-x-hidden overflow-y-auto',
        !isSettingsPage && 'scrollbar-hide',
        // Apply CSS animation when conditions are met
        shouldAnimate && 'tilt-animate'
      )}
      data-testid="tilt-wrapper"
    >
      {children}
    </div>
  )
}
