/**
 * UpgradePrompt Component
 * 升级提示组件（支持多种变体）
 */

'use client'

import { X, Sparkles, LogIn } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useUserTier } from '@/hooks/use-user-tier'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface UpgradePromptProps {
  /** 变体类型 */
  variant: 'banner' | 'modal' | 'inline'
  /** 点击登录/升级回调 */
  onAction?: () => void
  /** 点击关闭回调 */
  onDismiss?: () => void
  /** 自定义类名 */
  className?: string
}

/**
 * 升级提示组件
 * - banner: 顶部横幅（访客用户）
 * - modal: 弹窗（点击锁定功能时）
 * - inline: 内联提示（设置项旁边）
 */
export function UpgradePrompt({
  variant,
  onAction,
  onDismiss,
  className,
}: UpgradePromptProps) {
  const t = useTranslations('tier')
  const { isGuest } = useUserTier()
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const handleAction = () => {
    if (onAction) {
      onAction()
    } else if (isGuest) {
      signIn()
    }
  }

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss?.()
  }

  // Banner 变体
  if (variant === 'banner') {
    return (
      <div
        className={cn(
          'flex items-center justify-between gap-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-4 py-2 text-sm',
          className
        )}
      >
        <div className="flex items-center gap-2">
          {isGuest ? (
            <>
              <LogIn className="h-4 w-4 text-blue-500" />
              <span>{t('loginBanner')}</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span>{t('upgradeBanner')}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleAction}>
            {isGuest ? t('loginButton') : t('learnMore')}
          </Button>
          <button
            onClick={handleDismiss}
            className="rounded p-1 hover:bg-muted"
            aria-label={t('dismiss')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  // Inline 变体
  if (variant === 'inline') {
    return (
      <div
        className={cn(
          'flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm',
          className
        )}
      >
        {isGuest ? (
          <>
            <LogIn className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{t('loginInline')}</span>
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 text-purple-500" />
            <span className="text-muted-foreground">{t('upgradeInline')}</span>
          </>
        )}
        <Button variant="link" size="sm" className="h-auto p-0" onClick={handleAction}>
          {isGuest ? t('loginButton') : t('upgradeButton')}
        </Button>
      </div>
    )
  }

  // Modal 变体
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-4 rounded-lg border bg-card p-6 text-center shadow-lg',
        className
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20">
        {isGuest ? (
          <LogIn className="h-8 w-8 text-blue-500" />
        ) : (
          <Sparkles className="h-8 w-8 text-purple-500" />
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">
          {isGuest ? t('loginModalTitle') : t('upgradeModalTitle')}
        </h3>
        <p className="text-sm text-muted-foreground">
          {isGuest ? t('loginModalDescription') : t('upgradeModalDescription')}
        </p>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={handleDismiss}>
          {t('maybeLater')}
        </Button>
        <Button onClick={handleAction}>
          {isGuest ? t('loginButton') : t('upgradeButton')}
        </Button>
      </div>
    </div>
  )
}
