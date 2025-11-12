import { ref, computed, onMounted, onUnmounted } from 'vue'
import { newsPreloader, type IFeedSource } from '../services/NewsPreloader'
import { storage } from '../helpers/storage'
import { useRssFeeds } from './useRssFeeds'

export const useNewsPreloader = () => {
  const { feeds, activeFeedId } = useRssFeeds()
  const isPreloading = ref(false)
  const preloaderStats = ref(newsPreloader.getStats())
  const preloaderEnabled = ref(true)
  const preloadInterval = ref(30 * 60 * 1000) // 30 minutes default

  // Convert RSS feeds to IFeedSource format
  const feedSources = computed<IFeedSource[]>(() => {
    return feeds.value.map((feed) => ({
      id: feed.id,
      name: feed.name,
      url: feed.url,
      type: 'rss' as const,
      enabled: feed.enabled,
      lastUpdated: feed.lastUpdated,
      error: feed.error,
      rateLimit: {
        requests: 100, // Default rate limit
        window: 60 * 60 * 1000, // 1 hour window
      },
    }))
  })

  // Check if preloader is running
  const isPreloaderRunning = computed(() => {
    return preloaderStats.value.nextPreloadTime !== null
  })

  // Get cache status for active feed
  const activeFeedCacheStatus = computed(() => {
    if (!activeFeedId.value) return null
    const cacheKey = `news:${activeFeedId.value}`
    return {
      hasCache: newsPreloader.getCachedNews(activeFeedId.value) !== null,
      key: cacheKey,
    }
  })

  // Initialize preloader
  const initPreloader = async () => {
    try {
      // Save feed sources to storage for preloader
      await storage.set('feed.sources', feedSources.value)

      // Update preloader config
      newsPreloader.updateConfig({
        enabled: preloaderEnabled.value,
        interval: preloadInterval.value,
      })

      console.log('News preloader initialized with', feedSources.value.length, 'sources')
    } catch (error) {
      console.error('Failed to initialize news preloader:', error)
    }
  }

  // Manual preload trigger
  const triggerPreload = async (sourceIds?: string[]) => {
    isPreloading.value = true
    try {
      await newsPreloader.preloadNow(sourceIds)
      updateStats()
    } catch (error) {
      console.error('Manual preload failed:', error)
      throw error
    } finally {
      isPreloading.value = false
    }
  }

  // Update stats
  const updateStats = () => {
    preloaderStats.value = newsPreloader.getStats()
  }

  // Toggle preloader
  const togglePreloader = (enabled: boolean) => {
    preloaderEnabled.value = enabled
    newsPreloader.updateConfig({ enabled })
    updateStats()
  }

  // Update preload interval
  const setPreloadInterval = (interval: number) => {
    preloadInterval.value = interval
    newsPreloader.updateConfig({ interval })
    updateStats()
  }

  // Clear cache for a specific source
  const clearSourceCache = async (sourceId: string) => {
    await newsPreloader.clearSourceCache(sourceId)
    updateStats()
  }

  // Clear all preloaded cache
  const clearAllCache = async () => {
    await newsPreloader.clearAllCache()
    updateStats()
  }

  // Auto-sync feed sources when they change
  const syncFeedSources = async () => {
    try {
      await storage.set('feed.sources', feedSources.value)
      console.log('Feed sources synchronized with preloader')
    } catch (error) {
      console.error('Failed to sync feed sources:', error)
    }
  }

  // Set up periodic stats update
  let statsInterval: number | null = null

  onMounted(() => {
    // Initialize preloader
    initPreloader()

    // Update stats periodically
    statsInterval = window.setInterval(() => {
      updateStats()
    }, 5000) // Update every 5 seconds
  })

  onUnmounted(() => {
    if (statsInterval) {
      clearInterval(statsInterval)
    }
  })

  return {
    // State
    isPreloading,
    preloaderStats,
    preloaderEnabled,
    preloadInterval,

    // Computed
    isPreloaderRunning,
    activeFeedCacheStatus,
    feedSources,

    // Methods
    initPreloader,
    triggerPreload,
    togglePreloader,
    setPreloadInterval,
    clearSourceCache,
    clearAllCache,
    syncFeedSources,
    updateStats,

    // News access
    getCachedNews: newsPreloader.getCachedNews.bind(newsPreloader),
  }
}
