'use client'

import { useUIStore } from '@/lib/stores/ui-store'
import { useEffect, useState } from 'react'

interface UIWrapperProps {
  children: React.ReactNode
}

export function UIWrapper({ children }: UIWrapperProps) {
  const { fontSize, layoutMode } = useUIStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Avoid hydration mismatch by not applying classes until mounted
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <div className={`font-size-${fontSize} layout-${layoutMode}`}>
      {children}
    </div>
  )
}
