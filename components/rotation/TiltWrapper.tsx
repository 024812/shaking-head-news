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
  interval: propInterval,
}: TiltWrapperProps) {
  const { angle, setAngle, isPaused, mode, interval } = useRotationStore()
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [mounted, setMounted] = useState(false)
  const lastRotationTime = useRef<number>(Date.now())
  const previousAngle = useRef<number>(0)
  const pathname = usePathname()

  // Use props if provided, otherwise use store values
  const effectiveMode = propMode ?? mode
  const effectiveInterval = propInterval ?? interval

  // Disable rotation on settings and RSS pages
  const isSettingsPage = pathname === '/settings' || pathname === '/rss'

  // Mark as mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
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
    // Don't start rotation until mounted to avoid hydration issues
    if (!mounted) return

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

      // Record rotation (需求 8.1)
      const now = Date.now()
      const duration = Math.round((now - lastRotationTime.current) / 1000)
      lastRotationTime.current = now

      // Only record if there's a significant angle change (lowered threshold to 0.5 degrees)
      if (Math.abs(newAngle - previousAngle.current) > 0.5) {
        recordRotation(newAngle, duration).catch(() => {
          // Silent failure
        })
        previousAngle.current = newAngle
      }
    }, effectiveInterval * 1000)

    return () => clearInterval(timer)
  }, [
    effectiveMode,
    effectiveInterval,
    isPaused,
    prefersReducedMotion,
    isSettingsPage,
    setAngle,
    mounted,
  ])

  // Handle manual mode (mouse follow)
  useEffect(() => {
    if (!mounted) return

    if (effectiveMode === 'fixed' && !prefersReducedMotion && !isSettingsPage) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handleMouseMove = (e: any) => {
        // Calculate factor from -1 to 1 based on screen width
        // Left edge = -1, Center = 0, Right edge = 1
        const xFactor = (e.clientX / window.innerWidth) * 2 - 1

        // Map to -15 to 15 degrees
        // Mouse Left -> Tilt Left (negative angle)
        // Mouse Right -> Tilt Right (positive angle)
        const targetAngle = xFactor * 15

        setAngle(targetAngle)
      }

      window.addEventListener('mousemove', handleMouseMove)
      return () => window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [effectiveMode, prefersReducedMotion, isSettingsPage, setAngle, mounted])

  // Calculate the current rotation angle for CSS
  // Only apply rotation after mounting to avoid hydration mismatch
  const currentAngle = mounted && !prefersReducedMotion && !isSettingsPage ? angle : 0

  return (
    <div
      className={cn(
        'h-screen overflow-x-hidden overflow-y-auto',
        !isSettingsPage && 'scrollbar-hide'
      )}
      style={{
        transform: `rotate(${currentAngle}deg)`,
        transition: 'transform 0.6s ease-in-out',
      }}
      data-testid="tilt-wrapper"
    >
      {children}
    </div>
  )
}
