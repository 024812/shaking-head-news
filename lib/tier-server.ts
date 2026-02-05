/**
 * Server-side User Tier Utilities
 * 服务端用户层级检测工具
 *
 * 用于 Server Components
 */

import { getCurrentUser, hasProSubscription } from '@/lib/dal/auth'
import {
  UserTier,
  FeatureConfig,
  getFeaturesForTier,
  isFeatureEnabled,
} from '@/lib/config/features'

export interface ServerUserTier {
  /** 用户层级 */
  tier: UserTier
  /** 功能配置 */
  features: FeatureConfig
  /** 是否为访客 */
  isGuest: boolean
  /** 是否为会员 */
  isMember: boolean
  /** 是否为 Pro 用户 */
  isPro: boolean
  /** 用户信息 */
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
  } | null
  /** 检查特定功能是否可用 */
  hasFeature: (feature: keyof FeatureConfig) => boolean
}

/**
 * 获取用户层级（用于 Server Components）
 */
export async function getUserTier(): Promise<ServerUserTier> {
  const user = await getCurrentUser()

  let tier: UserTier = 'guest'
  if (user) {
    const isPro = await hasProSubscription()
    tier = isPro ? 'pro' : 'member'
  }

  const features = getFeaturesForTier(tier)

  const hasFeature = (feature: keyof FeatureConfig): boolean => {
    return isFeatureEnabled(tier, feature)
  }

  return {
    tier,
    features,
    isGuest: tier === 'guest',
    isMember: tier === 'member',
    isPro: tier === 'pro',
    user: user
      ? {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        }
      : null,
    hasFeature,
  }
}

/**
 * 检查当前用户是否有指定功能权限
 */
export async function checkFeatureAccess(feature: keyof FeatureConfig): Promise<boolean> {
  const { hasFeature } = await getUserTier()
  return hasFeature(feature)
}

/**
 * 要求指定功能权限，否则抛出错误
 */
export async function requireFeature(feature: keyof FeatureConfig): Promise<void> {
  const hasAccess = await checkFeatureAccess(feature)
  if (!hasAccess) {
    throw new Error(`Feature "${feature}" requires higher tier`)
  }
}
