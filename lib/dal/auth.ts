/**
 * Data Access Layer - Authentication
 * 认证数据访问层 (2025 最佳实践)
 *
 * 使用 React cache 避免重复调用
 * 在数据访问层进行认证检查，而非 middleware
 */

import { cache } from 'react'
import { auth } from '@/lib/auth'

export interface CurrentUser {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  subscription?: 'free' | 'pro'
}

/**
 * 获取当前用户（使用 React cache 避免重复调用）
 * 用于 Server Components
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  try {
    const session = await auth()
    if (!session?.user) {
      return null
    }

    return {
      id: session.user.id || session.user.email || '',
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
      // 订阅状态（未来从数据库获取）
      subscription: 'free',
    }
  } catch (error) {
    console.error('Failed to get current user:', error)
    return null
  }
})

/**
 * 验证用户是否已认证
 * 如果未认证则抛出错误
 */
export const verifyAuth = cache(async (): Promise<CurrentUser> => {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
})

/**
 * 检查用户是否已认证（不抛出错误）
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser()
  return user !== null
}

/**
 * 检查用户是否有 Pro 订阅
 */
export async function hasProSubscription(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.subscription === 'pro'
}
