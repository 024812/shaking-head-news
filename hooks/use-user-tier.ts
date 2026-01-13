/**
 * useUserTier Hook
 * 客户端用户层级检测 Hook
 */

'use client'

import { useSession } from 'next-auth/react'
import { useState, useTransition } from 'react'
import {
  UserTier,
  FeatureConfig,
  getFeaturesForTier,
  isFeatureEnabled,
} from '@/lib/config/features'
import { toggleProStatus } from '@/lib/actions/settings'

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
  /** 切换 Pro 状态（临时测试用） */
  togglePro: () => Promise<void>
  /** 是否正在切换 Pro 状态 */
  isTogglingPro: boolean
}

interface UseUserTierProps {
  /** 初始 Pro 状态（从服务端传入） */
  initialIsPro?: boolean
}

/**
 * 获取用户层级和功能配置
 */
export function useUserTier(props?: UseUserTierProps): UseUserTierReturn {
  const { data: session, status } = useSession()
  const [isProEnabled, setIsProEnabled] = useState(props?.initialIsPro ?? false)
  const [isPending, startTransition] = useTransition()

  // 切换 Pro 状态（调用 Server Action）
  const togglePro = async () => {
    startTransition(async () => {
      const result = await toggleProStatus()
      if (result.success && result.isPro !== undefined) {
        setIsProEnabled(result.isPro)
      }
    })
  }

  // 判断用户层级
  let tier: UserTier = 'guest'
  if (session) {
    tier = isProEnabled ? 'pro' : 'member'
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
    togglePro,
    isTogglingPro: isPending,
  }
}
