import { ref } from 'vue'
import { storage } from '../helpers/storage'
import type { IEverydayNews } from '../types'

export interface ICachedNews {
  data: IEverydayNews
  timestamp: number
  feedId: string
  expiresAt: number
}

export interface ICacheConfig {
  maxAge: number // Cache duration in milliseconds
  maxEntries: number // Maximum number of cached entries
  backgroundRefresh: boolean // Whether to refresh in background
}

const CACHE_KEY = 'news.cache'
const CACHE_METADATA_KEY = 'news.cache.metadata'

// Default cache configuration
const DEFAULT_CACHE_CONFIG: ICacheConfig = {
  maxAge: 30 * 60 * 1000, // 30 minutes
  maxEntries: 50, // Maximum 50 cached entries
  backgroundRefresh: true,
}

export const useNewsCache = () => {
  const cache = ref<Map<string, ICachedNews>>(new Map())
  const config = ref<ICacheConfig>({ ...DEFAULT_CACHE_CONFIG })
  const isLoading = ref(false)

  // Generate cache key from feed info and date
  const generateCacheKey = (feedId: string, date?: string): string => {
    const dateStr = date || new Date().toISOString().split('T')[0]
    return `${feedId}:${dateStr}`
  }

  // Check if cached data is still valid
  const isCacheValid = (cachedItem: ICachedNews): boolean => {
    return Date.now() < cachedItem.expiresAt
  }

  // Check if cached data is nearing expiration (for background refresh)
  const isNearingExpiration = (cachedItem: ICachedNews): boolean => {
    const timeToExpiry = cachedItem.expiresAt - Date.now()
    const refreshThreshold = config.value.maxAge * 0.2 // Refresh when 20% time remaining
    return timeToExpiry < refreshThreshold
  }

  // Get cached news data
  const getCachedNews = (feedId: string, date?: string): ICachedNews | null => {
    const key = generateCacheKey(feedId, date)
    const cachedItem = cache.value.get(key)

    if (cachedItem && isCacheValid(cachedItem)) {
      return cachedItem
    }

    // Remove expired cache entry
    if (cachedItem) {
      cache.value.delete(key)
    }

    return null
  }

  // Store news data in cache
  const setCachedNews = (
    feedId: string,
    newsData: IEverydayNews,
    date?: string,
  ): void => {
    const key = generateCacheKey(feedId, date)
    const cachedItem: ICachedNews = {
      data: newsData,
      timestamp: Date.now(),
      feedId,
      expiresAt: Date.now() + config.value.maxAge,
    }

    cache.value.set(key, cachedItem)
    
    // Enforce cache size limit
    if (cache.value.size > config.value.maxEntries) {
      cleanupOldEntries()
    }

    saveCache()
  }

  // Remove old cache entries to maintain size limit
  const cleanupOldEntries = (): void => {
    const entries = Array.from(cache.value.entries())
    
    // Sort by timestamp (oldest first)
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
    
    // Remove oldest entries until under limit
    const entriesToRemove = entries.length - config.value.maxEntries + 10 // Remove extra for buffer
    
    for (let i = 0; i < entriesToRemove && i < entries.length; i++) {
      cache.value.delete(entries[i][0])
    }
  }

  // Clear expired cache entries
  const clearExpiredEntries = (): void => {
    const now = Date.now()
    const entriesToDelete: string[] = []

    cache.value.forEach((item, key) => {
      if (now >= item.expiresAt) {
        entriesToDelete.push(key)
      }
    })

    entriesToDelete.forEach(key => cache.value.delete(key))
    
    if (entriesToDelete.length > 0) {
      saveCache()
    }
  }

  // Clear all cache entries
  const clearCache = (): void => {
    cache.value.clear()
    storage.removeItem(CACHE_KEY)
    storage.removeItem(CACHE_METADATA_KEY)
  }

  // Get cache statistics
  const getCacheStats = () => {
    const now = Date.now()
    let validEntries = 0
    let expiredEntries = 0
    let totalSize = 0

    cache.value.forEach((item) => {
      if (now < item.expiresAt) {
        validEntries++
      } else {
        expiredEntries++
      }
      totalSize += JSON.stringify(item.data).length
    })

    return {
      totalEntries: cache.value.size,
      validEntries,
      expiredEntries,
      totalSize,
      maxEntries: config.value.maxEntries,
      cacheHitRate: 0, // This would need to be tracked separately
    }
  }

  // Check if background refresh is needed
  const needsBackgroundRefresh = (feedId: string, date?: string): boolean => {
    if (!config.value.backgroundRefresh) return false
    
    const cachedItem = getCachedNews(feedId, date)
    return cachedItem ? isNearingExpiration(cachedItem) : false
  }

  // Save cache to storage
  const saveCache = async (): Promise<void> => {
    try {
      const cacheData = Array.from(cache.value.entries())
      await storage.setItem(CACHE_KEY, JSON.stringify(cacheData))
      
      const metadata = {
        lastCleanup: Date.now(),
        config: config.value,
      }
      await storage.setItem(CACHE_METADATA_KEY, JSON.stringify(metadata))
    } catch (error) {
      console.warn('Failed to save news cache:', error)
    }
  }

  // Load cache from storage
  const loadCache = async (): Promise<void> => {
    try {
      const cacheData = await storage.getItem(CACHE_KEY)
      const metadata = await storage.getItem(CACHE_METADATA_KEY)

      if (cacheData) {
        const parsed = JSON.parse(cacheData) as [string, ICachedNews][]
        cache.value = new Map(parsed)
        
        // Clean expired entries on load
        clearExpiredEntries()
      }

      if (metadata) {
        const parsedMetadata = JSON.parse(metadata)
        if (parsedMetadata.config) {
          config.value = { ...DEFAULT_CACHE_CONFIG, ...parsedMetadata.config }
        }
      }
    } catch (error) {
      console.warn('Failed to load news cache:', error)
      cache.value = new Map()
    }
  }

  // Update cache configuration
  const updateConfig = (newConfig: Partial<ICacheConfig>): void => {
    config.value = { ...config.value, ...newConfig }
    saveCache()
  }

  return {
    cache,
    config,
    isLoading,
    getCachedNews,
    setCachedNews,
    clearCache,
    clearExpiredEntries,
    getCacheStats,
    needsBackgroundRefresh,
    loadCache,
    updateConfig,
    generateCacheKey,
  }
}