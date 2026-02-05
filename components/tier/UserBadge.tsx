/**
 * UserBadge Component
 * 显示用户层级徽章（会员/Pro）
 */

'use client'

import { useUserTier } from '@/hooks/use-user-tier'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

interface UserBadgeProps {
  /** 自定义类名 */
  className?: string
  /** 是否显示为小尺寸 */
  small?: boolean
}

/**
 * 用户层级徽章
 * - 访客：不显示
 * - 会员：蓝色徽章
 * - Pro：渐变紫色徽章
 */
export function UserBadge({ className, small = false }: UserBadgeProps) {
  const t = useTranslations('tier')
  const { tier, isGuest } = useUserTier()

  if (isGuest) return null

  const badgeConfig = {
    member: {
      label: t('memberBadge'),
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    },
    pro: {
      label: t('proBadge'),
      className: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm',
    },
  }

  const config = badgeConfig[tier as 'member' | 'pro']

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        small ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
