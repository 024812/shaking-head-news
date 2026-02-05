'use client'

import { motion } from 'framer-motion'
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
  interval: propInterval,
}: TiltWrapperProps) {
  const { angle, setAngle, isPaused, mode, interval } = useRotationStore()
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const lastRotationTime = useRef<number>(Date.now())
  const previousAngle = useRef<number>(0)
  const pathname = usePathname()

  // Use props if provided, otherwise use store values
  const effectiveMode = propMode ?? mode
  const effectiveInterval = propInterval ?? interval

  // Disable rotation on settings and RSS pages
  const isSettingsPage = pathname === '/settings' || pathname === '/rss'

  // Manually rehydrate zustand store after mount
  useEffect(() => {
    try {
      useRotationStore.persist.rehydrate()
    } catch (e) {
      console.error('Rehydration failed:', e)
    }
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

  // Handle rotation logic
  useEffect(() => {
    // Only block if actually paused or strict mode requirements
    // Removed isHydrated check here to allow immediate start if possible,
    // though safe to wait for mount.
    if (!isHydrated) return

    if (isPaused || effectiveMode === 'fixed' || prefersReducedMotion || isSettingsPage) {
      return
    }

    // Continuous mode: change angle at intervals
    const timer = setInterval(() => {
      // Generate random angle with absolute value between 5 and 20 degrees
      const angleMagnitude = Math.random() * 15 + 5 // 5 to 20
      const sign = Math.random() < 0.5 ? 1 : -1
      const newAngle = angleMagnitude * sign
      setAngle(newAngle)

      // Record rotation
      const now = Date.now()
      const duration = Math.round((now - lastRotationTime.current) / 1000)
      lastRotationTime.current = now

      // Only record if there's a significant angle change
      if (Math.abs(newAngle - previousAngle.current) > 0.5) {
        recordRotation(newAngle, duration).catch(() => {
          // Silent failure
        })
        previousAngle.current = newAngle
      }
    }, effectiveInterval * 1000)

    // Trigger immediate rotation on start if angle is 0 (optional, helps separate "startup" from interval)
    // but better to let interval handle it to avoid jumps.

    return () => clearInterval(timer)
  }, [
    effectiveMode,
    effectiveInterval,
    isPaused,
    prefersReducedMotion,
    isSettingsPage,
    setAngle,
    isHydrated,
  ])

  // Handle manual mode (mouse follow)
  useEffect(() => {
    if (!isHydrated) return

    if (effectiveMode === 'fixed' && !prefersReducedMotion && !isSettingsPage) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handleMouseMove = (e: any) => {
        const xFactor = (e.clientX / window.innerWidth) * 2 - 1
        const targetAngle = xFactor * 15
        setAngle(targetAngle)
      }

      window.addEventListener('mousemove', handleMouseMove)
      return () => window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [effectiveMode, prefersReducedMotion, isSettingsPage, setAngle, isHydrated])

  // If user prefers reduced motion, render without animation
  if (prefersReducedMotion) {
    return (
      <div
        className={cn(
          'h-screen overflow-x-hidden overflow-y-auto',
          !isSettingsPage && 'scrollbar-hide'
        )}
      >
        {children}
      </div>
    )
  }

  return (
    <motion.div
      animate={{ rotate: angle }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      className={cn(
        'h-screen overflow-x-hidden overflow-y-auto',
        !isSettingsPage && 'scrollbar-hide'
      )}
      data-testid="tilt-wrapper"
    >
      {children}
    </motion.div>
  )
}
