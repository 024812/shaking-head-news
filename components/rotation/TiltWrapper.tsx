'use client'

import { motion } from 'framer-motion'
import { useRotationStore } from '@/lib/stores/rotation-store'
import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { recordRotation } from '@/lib/actions/stats'

interface TiltWrapperProps {
  children: React.ReactNode
  mode?: 'fixed' | 'continuous'
  interval?: number
}

export function TiltWrapper({
  children,
  mode: propMode,
  interval: propInterval,
}: TiltWrapperProps) {
  const { angle, setAngle, isPaused, mode, interval } = useRotationStore()
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const lastRotationTime = useRef<number>(Date.now())
  const previousAngle = useRef<number>(0)
  const pathname = usePathname()

  // Use props if provided, otherwise use store values
  const effectiveMode = propMode ?? mode
  const effectiveInterval = propInterval ?? interval

  // Disable rotation on settings page
  const isSettingsPage = pathname === '/settings'

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

  // Handle rotation logic
  useEffect(() => {
    if (isPaused || effectiveMode === 'fixed' || prefersReducedMotion || isSettingsPage) {
      return
    }

    // Continuous mode: change angle at intervals
    const timer = setInterval(() => {
      // Generate random angle between -10 and 10 degrees
      const newAngle = Math.random() * 20 - 10
      setAngle(newAngle)

      // Record rotation (需求 8.1)
      const now = Date.now()
      const duration = Math.round((now - lastRotationTime.current) / 1000)
      lastRotationTime.current = now

      // Only record if there's a significant angle change (lowered threshold to 0.5 degrees)
      if (Math.abs(newAngle - previousAngle.current) > 0.5) {
        console.log('[TiltWrapper] Recording rotation:', { newAngle, duration })
        recordRotation(newAngle, duration)
          .then((result) => {
            if (result === null) {
              console.warn(
                '[TiltWrapper] Record returned null - user may not be logged in or error occurred'
              )
            } else {
              console.log('[TiltWrapper] Record SUCCESS:', {
                count: result.rotationCount,
                totalDuration: result.totalDuration,
              })
            }
          })
          .catch((error) => {
            console.error('[TiltWrapper] Failed to record rotation:', error)
          })
        previousAngle.current = newAngle
      } else {
        console.log('[TiltWrapper] Skipping record - angle change too small:', {
          newAngle,
          previousAngle: previousAngle.current,
          diff: Math.abs(newAngle - previousAngle.current),
        })
      }
    }, effectiveInterval * 1000)

    return () => clearInterval(timer)
  }, [effectiveMode, effectiveInterval, isPaused, prefersReducedMotion, isSettingsPage, setAngle])

  // Set initial angle for fixed mode
  useEffect(() => {
    if (effectiveMode === 'fixed' && !prefersReducedMotion && !isSettingsPage) {
      // Fixed mode: angle between -2 and 2 degrees
      const fixedAngle = Math.random() * 4 - 2
      setAngle(fixedAngle)
    }
  }, [effectiveMode, prefersReducedMotion, isSettingsPage, setAngle])

  // If user prefers reduced motion, render without animation
  if (prefersReducedMotion) {
    return <div className="min-h-screen">{children}</div>
  }

  return (
    <motion.div
      animate={{ rotate: angle }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      className="min-h-screen"
      data-testid="tilt-wrapper"
    >
      {children}
    </motion.div>
  )
}
