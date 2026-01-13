/**
 * useUserTier Hook
 * 客户端用户层级检测 Hook
 */

'use client'

import { useSession } from 'next-auth/react'
import {
  UserTier,
  FeatureConfig,
  getFeaturesForTier,
  isFeatureEnabled,
} from '@/lib/config/features'

export interface UseUserTierReturn {
  /** 用户层级 */
  tier: UserTier
  /** 功能配置 */
  features: FeatureConfig
  /** 是否正在加载 */
  isLoading: boolean
  /** 是否已认证 */
  isAuthenticated: boolean
  /** 是否为访客 */
  isGuest: boolean
  /** 是否为会员 */
  isMember: boolean
  /** 是否为 Pro 用户 */
  isPro: boolean
  /** 用户信息 */
  user: {
    id?: string
    name?: string | null
    email?: string | null
    image?: string | null
  } | null
  /** 检查特定功能是否可用 */
  hasFeature: (feature: keyof FeatureConfig) => boolean
}

/**
 * 获取用户层级和功能配置
 */
export function useUserTier(): UseUserTierReturn {
  const { data: session, status } = useSession()

  // 判断用户层级
  let tier: UserTier = 'guest'
  if (session) {
    // 检查是否有 Pro 订阅（未来实现）
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hasProSubscription = (session.user as any)?.subscription === 'pro'
    tier = hasProSubscription ? 'pro' : 'member'
  }

  const features = getFeaturesForTier(tier)
  const isLoading = status === 'loading'
  const isAuthenticated = !!session
  const isGuest = tier === 'guest'
  const isMember = tier === 'member'
  const isPro = tier === 'pro'

  const user = session?.user
    ? {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }
    : null

  const hasFeature = (feature: keyof FeatureConfig): boolean => {
    return isFeatureEnabled(tier, feature)
  }

  return {
    tier,
    features,
    isLoading,
    isAuthenticated,
    isGuest,
    isMember,
    isPro,
    user,
    hasFeature,
  }
}
