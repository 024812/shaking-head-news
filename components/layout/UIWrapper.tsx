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

  useEffect(() => {
    if (mounted) {
      // Apply font size to document root
      document.documentElement.setAttribute('data-font-size', fontSize)
      document.documentElement.setAttribute('data-layout-mode', layoutMode)
    }
  }, [mounted, fontSize, layoutMode])

  return <>{children}</>
}
