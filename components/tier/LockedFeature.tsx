/**
 * LockedFeature Component
 * 显示锁定功能状态和登录/升级提示
 */

'use client'

import { Lock } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { signIn } from 'next-auth/react'
import { useUserTier } from '@/hooks/use-user-tier'
import { FeatureConfig, getRequiredTierForFeature } from '@/lib/config/features'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface LockedFeatureProps {
  /** 功能名称（用于显示） */
  featureName: keyof FeatureConfig
  /** 所需的最低层级 */
  requiredTier?: 'member' | 'pro'
  /** 自定义描述 */
  description?: string
  /** 点击登录回调 */
  onLoginClick?: () => void
  /** 是否显示为紧凑模式 */
  compact?: boolean
  /** 自定义样式类 */
  className?: string
}

/**
 * 显示锁定功能状态
 */
export function LockedFeature({
  featureName,
  requiredTier,
  description,
  onLoginClick,
  compact = false,
  className,
}: LockedFeatureProps) {
  const t = useTranslations('tier')
  const { isGuest } = useUserTier()

  // 自动检测所需层级
  const actualRequiredTier = requiredTier || getRequiredTierForFeature(featureName)

  const handleClick = () => {
    if (onLoginClick) {
      onLoginClick()
    } else if (isGuest) {
      signIn()
    }
  }

  // 紧凑模式（用于设置项）
  if (compact) {
    return (
      <div className="text-muted-foreground flex items-center gap-2">
        <Lock className="h-4 w-4" />
        <span className="text-sm">{isGuest ? t('loginToUnlock') : t('upgradeToUnlock')}</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'border-muted-foreground/30 bg-muted/30 flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-6 text-center',
        className
      )}
    >
      <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
        <Lock className="text-muted-foreground h-6 w-6" />
      </div>

      <div className="space-y-1">
        <p className="text-foreground font-medium">
          {t(`features.${featureName}`, { defaultValue: featureName })}
        </p>
        <p className="text-muted-foreground text-sm">
          {description ||
            (isGuest
              ? t('loginToUnlockDescription')
              : actualRequiredTier === 'pro'
                ? t('proFeatureDescription')
                : t('memberFeatureDescription'))}
        </p>
      </div>

      <Button variant="outline" size="sm" onClick={handleClick}>
        {isGuest ? t('loginButton') : t('upgradeButton')}
      </Button>
    </div>
  )
}
