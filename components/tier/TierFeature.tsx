/**
 * TierFeature Component
 * 根据用户层级条件渲染功能
 */

'use client'

import { useUserTier } from '@/hooks/use-user-tier'
import { FeatureConfig } from '@/lib/config/features'
import { LockedFeature } from './LockedFeature'

interface TierFeatureProps {
  /** 要检查的功能 */
  feature: keyof FeatureConfig
  /** 功能可用时渲染的内容 */
  children: React.ReactNode
  /** 功能不可用时的备选内容 */
  fallback?: React.ReactNode
  /** 是否显示锁定状态 */
  showLock?: boolean
  /** 所需的最低层级（用于显示正确的提示） */
  requiredTier?: 'member' | 'pro'
}

/**
 * 根据功能配置条件渲染内容
 *
 * @example
 * ```tsx
 * <TierFeature feature="customRssEnabled" requiredTier="member">
 *   <RssManager />
 * </TierFeature>
 * ```
 */
export function TierFeature({
  feature,
  children,
  fallback,
  showLock = true,
  requiredTier,
}: TierFeatureProps) {
  const { features } = useUserTier()

  if (features[feature]) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  if (showLock) {
    return <LockedFeature featureName={feature} requiredTier={requiredTier} />
  }

  return null
}
