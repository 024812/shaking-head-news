/**
 * TierFeatureServer Component
 * 服务端用户层级条件渲染组件
 */

import { getUserTier } from '@/lib/tier-server'
import { FeatureConfig } from '@/lib/config/features'

interface TierFeatureServerProps {
  /** 要检查的功能 */
  feature: keyof FeatureConfig
  /** 功能可用时渲染的内容 */
  children: React.ReactNode
  /** 功能不可用时的备选内容 */
  fallback?: React.ReactNode
}

/**
 * 服务端条件渲染组件
 * 用于 Server Components
 *
 * @example
 * ```tsx
 * <TierFeatureServer feature="statsFullEnabled" fallback={<BlurredStats />}>
 *   <FullStats />
 * </TierFeatureServer>
 * ```
 */
export async function TierFeatureServer({
  feature,
  children,
  fallback,
}: TierFeatureServerProps) {
  const { features } = await getUserTier()

  if (features[feature]) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return null
}
