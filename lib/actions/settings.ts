'use server'

import { auth } from '@/lib/auth'
import { getStorageItem, setStorageItem, StorageKeys } from '@/lib/storage'
import { UserSettingsSchema, defaultSettings, UserSettings } from '@/types/settings'
import { revalidatePath } from 'next/cache'
import { AuthError, logError, validateOrThrow } from '@/lib/utils/error-handler'
import { rateLimitByUser, RateLimitTiers } from '@/lib/rate-limit'
import { sanitizeObject } from '@/lib/utils/input-validation'

/**
 * 获取用户设置
 * 如果用户未登录，返回默认设置
 * 如果用户已登录但没有保存的设置，返回带用户ID的默认设置
 */
export async function getUserSettings(): Promise<UserSettings> {
  const session = await auth()

  if (!session?.user?.id) {
    // 未登录用户返回默认设置（不含userId）
    return { ...defaultSettings, userId: '' }
  }

  try {
    const settings = await getStorageItem<UserSettings>(StorageKeys.userSettings(session.user.id))

    if (!settings) {
      // 用户首次访问，返回默认设置
      return { ...defaultSettings, userId: session.user.id }
    }

    // 验证并返回存储的设置
    return validateOrThrow(UserSettingsSchema, settings)
  } catch (error) {
    logError(error, {
      action: 'getUserSettings',
      userId: session.user.id,
    })
    // 出错时返回默认设置
    return { ...defaultSettings, userId: session.user.id }
  }
}

/**
 * 更新用户设置
 * 只有登录用户可以保存设置
 * 包含速率限制和输入验证
 */
export async function updateSettings(
  settings: Partial<UserSettings>
): Promise<{ success: boolean; error?: string; settings?: UserSettings }> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      throw new AuthError('Please sign in to save settings')
    }

    // 速率限制：每分钟最多300次更新（非常宽松，支持滑块频繁调整）
    const rateLimitResult = await rateLimitByUser(session.user.id, {
      limit: 300,
      window: 60,
    })

    if (!rateLimitResult.success) {
      throw new Error('Too many requests. Please try again later.')
    }

    // 清理输入数据
    const sanitizedSettings = sanitizeObject(settings, {
      maxLength: 1000,
      allowHtml: false,
    })

    // 获取当前设置
    const currentSettings = await getUserSettings()

    // 合并新设置
    const newSettings = {
      ...currentSettings,
      ...sanitizedSettings,
      userId: session.user.id, // 确保userId不被覆盖
    }

    // 验证数据
    const validatedSettings = validateOrThrow(UserSettingsSchema, newSettings)

    // 存储到 Vercel Marketplace Storage
    await setStorageItem(StorageKeys.userSettings(session.user.id), validatedSettings)

    // 重新验证相关页面
    revalidatePath('/')
    revalidatePath('/settings')

    return {
      success: true,
      settings: validatedSettings,
    }
  } catch (error) {
    logError(error, {
      action: 'updateSettings',
      settings,
    })

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update settings',
    }
  }
}

/**
 * 重置用户设置为默认值
 * 包含速率限制和权限验证
 */
export async function resetSettings(): Promise<{
  success: boolean
  error?: string
  settings?: UserSettings
}> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      throw new AuthError('Please sign in to reset settings')
    }

    // 速率限制：每15分钟最多5次重置
    const rateLimitResult = await rateLimitByUser(session.user.id, {
      ...RateLimitTiers.STRICT,
    })

    if (!rateLimitResult.success) {
      throw new Error('Too many reset attempts. Please try again later.')
    }

    const resetSettings = {
      ...defaultSettings,
      userId: session.user.id,
    }

    await setStorageItem(StorageKeys.userSettings(session.user.id), resetSettings)

    // 重新验证相关页面
    revalidatePath('/')
    revalidatePath('/settings')

    return {
      success: true,
      settings: resetSettings,
    }
  } catch (error) {
    logError(error, {
      action: 'resetSettings',
    })

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reset settings',
    }
  }
}


/**
 * 切换 Pro 状态（临时测试用）
 * 将 Pro 状态存储在云端
 */
export async function toggleProStatus(): Promise<{
  success: boolean
  error?: string
  isPro?: boolean
}> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      throw new AuthError('Please sign in to toggle Pro status')
    }

    // 获取当前设置
    const currentSettings = await getUserSettings()

    // 切换 Pro 状态
    const newIsPro = !currentSettings.isPro

    // 更新设置
    const newSettings = {
      ...currentSettings,
      isPro: newIsPro,
    }

    // 存储到云端
    await setStorageItem(StorageKeys.userSettings(session.user.id), newSettings)

    // 重新验证相关页面
    revalidatePath('/')
    revalidatePath('/settings')
    revalidatePath('/stats')
    revalidatePath('/rss')

    return {
      success: true,
      isPro: newIsPro,
    }
  } catch (error) {
    logError(error, {
      action: 'toggleProStatus',
    })

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to toggle Pro status',
    }
  }
}
