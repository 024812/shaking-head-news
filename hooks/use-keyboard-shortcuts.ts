/**
 * Keyboard Shortcuts Hook
 * 键盘快捷键 hook - Pro 功能
 * 
 * 当前为占位实现，待 Pro 订阅系统完成后启用
 */

'use client'

import { useEffect, useCallback } from 'react'
import { useUserTier } from './use-user-tier'

export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  description: string
  action: () => void
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[]
  enabled?: boolean
}

/**
 * 键盘快捷键 hook
 * 仅 Pro 用户可用
 */
export function useKeyboardShortcuts({ shortcuts, enabled = true }: UseKeyboardShortcutsOptions) {
  const { isPro, features } = useUserTier()

  // 检查是否启用快捷键
  const isEnabled = enabled && isPro && features.keyboardShortcutsEnabled

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isEnabled) return

      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey
        const altMatch = shortcut.alt ? event.altKey : !event.altKey

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          event.preventDefault()
          shortcut.action()
          break
        }
      }
    },
    [isEnabled, shortcuts]
  )

  useEffect(() => {
    if (!isEnabled) return

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isEnabled, handleKeyDown])

  return {
    isEnabled,
    isPro,
  }
}

/**
 * 默认快捷键配置
 */
export const DEFAULT_SHORTCUTS: Omit<KeyboardShortcut, 'action'>[] = [
  { key: 'Space', description: '暂停/继续旋转' },
  { key: 'ArrowLeft', description: '上一条新闻' },
  { key: 'ArrowRight', description: '下一条新闻' },
  { key: 'r', description: '刷新新闻' },
  { key: 's', ctrl: true, description: '打开设置' },
  { key: '/', description: '显示快捷键帮助' },
]

export default useKeyboardShortcuts
