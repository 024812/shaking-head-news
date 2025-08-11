import { ref, onMounted } from 'vue'
import { storage } from '../helpers/storage'
import { EverydayNewsService } from '../services/EverydayNewsService'

export interface IRssFeed {
  id: string
  name: string
  url: string
  enabled: boolean
  lastUpdated?: string
  error?: string
}

const RSS_FEEDS_KEY = 'setting.rssFeeds'
const ACTIVE_FEED_KEY = 'setting.activeFeed'

export const useRssFeeds = () => {
  const feeds = ref<IRssFeed[]>([])
  const activeFeedId = ref<string>('')
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Default feeds
  const defaultFeeds: IRssFeed[] = [
    {
      id: 'everydaynews',
      name: '每日新闻 (EverydayNews)',
      url: 'https://ravelloh.github.io/EverydayNews',
      enabled: true,
    },
    {
      id: 'ravelloh-rss',
      name: 'Ravelloh RSS',
      url: 'https://news.ravelloh.top/rss.xml',
      enabled: true,
    },
  ]

  const generateId = () => {
    return `feed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const addFeed = (name: string, url: string) => {
    const newFeed: IRssFeed = {
      id: generateId(),
      name: name.trim(),
      url: url.trim(),
      enabled: true,
    }
    feeds.value.push(newFeed)
    saveFeeds()
    return newFeed
  }

  const removeFeed = (feedId: string) => {
    const index = feeds.value.findIndex((f) => f.id === feedId)
    if (index > -1) {
      feeds.value.splice(index, 1)
      // If removing the active feed, switch to the first available
      if (activeFeedId.value === feedId && feeds.value.length > 0) {
        activeFeedId.value = feeds.value[0].id
        storage.setItem(ACTIVE_FEED_KEY, activeFeedId.value)
      }
      saveFeeds()
    }
  }

  const toggleFeed = (feedId: string) => {
    const feed = feeds.value.find((f) => f.id === feedId)
    if (feed) {
      feed.enabled = !feed.enabled
      saveFeeds()
    }
  }

  const setActiveFeed = (feedId: string) => {
    const feed = feeds.value.find((f) => f.id === feedId)
    if (feed && feed.enabled) {
      activeFeedId.value = feedId
      storage.setItem(ACTIVE_FEED_KEY, feedId)
    }
  }

  const getActiveFeed = (): IRssFeed | null => {
    return feeds.value.find((f) => f.id === activeFeedId.value) || null
  }

  const validateFeedUrl = async (url: string): Promise<{ valid: boolean; error?: string }> => {
    try {
      const service = new EverydayNewsService(url)
      const result = await service.getNewsFromRss(url)
      return { valid: result !== null }
    } catch (err) {
      return {
        valid: false,
        error: err instanceof Error ? err.message : 'Invalid RSS feed',
      }
    }
  }

  const testFeed = async (feedId: string): Promise<boolean> => {
    const feed = feeds.value.find((f) => f.id === feedId)
    if (!feed) return false

    isLoading.value = true
    error.value = null

    try {
      const validation = await validateFeedUrl(feed.url)
      if (validation.valid) {
        feed.error = undefined
        feed.lastUpdated = new Date().toISOString()
      } else {
        feed.error = validation.error || 'Feed validation failed'
      }
      saveFeeds()
      return validation.valid
    } catch (err) {
      feed.error = err instanceof Error ? err.message : 'Test failed'
      saveFeeds()
      return false
    } finally {
      isLoading.value = false
    }
  }

  const saveFeeds = async () => {
    await storage.setItem(RSS_FEEDS_KEY, JSON.stringify(feeds.value))
  }

  const loadFeeds = async () => {
    try {
      const stored = await storage.getItem(RSS_FEEDS_KEY)
      const storedActiveFeed = await storage.getItem(ACTIVE_FEED_KEY)

      if (stored) {
        const parsed = JSON.parse(stored) as IRssFeed[]
        feeds.value = parsed
      } else {
        // Initialize with default feeds
        feeds.value = [...defaultFeeds]
        await saveFeeds()
      }

      // Set active feed
      if (storedActiveFeed && feeds.value.some((f) => f.id === storedActiveFeed)) {
        activeFeedId.value = storedActiveFeed
      } else if (feeds.value.length > 0) {
        activeFeedId.value = feeds.value[0].id
        await storage.setItem(ACTIVE_FEED_KEY, activeFeedId.value)
      }
    } catch (err) {
      console.warn('Failed to load RSS feeds:', err)
      feeds.value = [...defaultFeeds]
      activeFeedId.value = defaultFeeds[0].id
    }
  }

  onMounted(loadFeeds)

  return {
    feeds,
    activeFeedId,
    isLoading,
    error,
    addFeed,
    removeFeed,
    toggleFeed,
    setActiveFeed,
    getActiveFeed,
    validateFeedUrl,
    testFeed,
  }
}
