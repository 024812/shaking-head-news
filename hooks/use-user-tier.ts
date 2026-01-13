/**
 * useUserTier Hook
 * 客户端用户层级检测 Hook
 */

'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect, useCallback } from 'react'
import {
  UserTier,
  FeatureConfig,
  getFeaturesForTier,
  isFeatureEnabled,
} from '@/lib/config/features'

// 用于存储 Pro 状态的 key
const PRO_STATUS_KEY = 'user_pro_status'

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
  togglePro: () => void
}

/**
 * 获取用户层级和功能配置
 */
export function useUserTier(): UseUserTierReturn {
  const { data: session, status } = useSession()
  const [isProEnabled, setIsProEnabled] = useState(false)

  // 从 localStorage 读取 Pro 状态
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(PRO_STATUS_KEY)
      setIsProEnabled(stored === 'true')
    }
  }, [])

  // 切换 Pro 状态
  const togglePro = useCallback(() => {
    const newValue = !isProEnabled
    setIsProEnabled(newValue)
    if (typeof window !== 'undefined') {
      localStorage.setItem(PRO_STATUS_KEY, String(newValue))
    }
    // 刷新页面以应用新状态
    window.location.reload()
  }, [isProEnabled])

  // 判断用户层级
  let tier: UserTier = 'guest'
  if (session) {
    // 检查是否有 Pro 订阅（从 localStorage 读取临时状态）
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
  }
}
