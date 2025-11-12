import { Redis } from '@upstash/redis'

// 检查环境变量
const redisUrl = process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

if (!redisUrl || !redisToken) {
  console.error('[Storage] Missing Redis configuration:', {
    hasUrl: !!redisUrl,
    hasToken: !!redisToken,
    env: process.env.NODE_ENV,
  })
}

// 创建 Storage 客户端（使用 Upstash Redis）
// 如果环境变量缺失，使用空字符串避免构建时错误
export const storage = new Redis({
  url: redisUrl || '',
  token: redisToken || '',
})

// 类型安全的存储操作
export async function getStorageItem<T>(key: string): Promise<T | null> {
  try {
    return await storage.get<T>(key)
  } catch (error) {
    console.error(`Failed to get storage item: ${key}`, error)
    return null
  }
}

export async function setStorageItem<T>(
  key: string,
  value: T,
  expirationSeconds?: number
): Promise<void> {
  try {
    if (expirationSeconds) {
      await storage.set(key, value, { ex: expirationSeconds })
    } else {
      await storage.set(key, value)
    }
  } catch (error) {
    console.error(`Failed to set storage item: ${key}`, error)
    throw error
  }
}

export async function deleteStorageItem(key: string): Promise<void> {
  try {
    await storage.del(key)
  } catch (error) {
    console.error(`Failed to delete storage item: ${key}`, error)
    throw error
  }
}

// 批量操作
export async function getMultipleStorageItems(
  keys: string[]
): Promise<unknown[]> {
  try {
    return await storage.mget(...keys)
  } catch (error) {
    console.error('Failed to get multiple storage items', error)
    return keys.map(() => null)
  }
}

// 存储键格式化函数
export const StorageKeys = {
  userSettings: (userId: string) => `user:${userId}:settings`,
  userStats: (userId: string, date: string) => `user:${userId}:stats:${date}`,
  userRSSSources: (userId: string) => `user:${userId}:rss-sources`,
  rateLimit: (identifier: string) => `rate-limit:${identifier}`,
}
