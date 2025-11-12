import { ref } from 'vue'
import { storage } from '../helpers/storage'

export interface IRssFeed {
  id: string
  name: string
  url: string
  isActive: boolean
  enabled: boolean
  lastUpdated?: string
  error?: string
}

const STORAGE_KEY = 'setting.rssFeeds'
const ACTIVE_FEED_KEY = 'setting.activeFeed'

const defaultFeeds: IRssFeed[] = [
  {
    id: 'everyday-news',
    name: 'EverydayNews',
    url: 'https://ravelloh.github.io/EverydayNews',
    isActive: true,
    enabled: true,
  },
  {
    id: 'thepaper-cn',
    name: '澎湃新闻 (The Paper)',
    url: 'https://www.thepaper.cn/expressNews',
    isActive: false,
    enabled: true,
  },
  {
    id: 'ravelloh-rss',
    name: 'Ravelloh RSS',
    url: 'https://news.ravelloh.top/rss.xml',
    isActive: false,
    enabled: true,
  },
]

const rssFeeds = ref<IRssFeed[]>(defaultFeeds)
const activeFeedId = ref<string>('everyday-news')

export const useRssFeeds = () => {
  const loadFeeds = async () => {
    try {
      const stored = await storage.get<IRssFeed[]>(STORAGE_KEY)
      if (stored && Array.isArray(stored) && stored.length > 0) {
        rssFeeds.value = stored
      } else {
        // Ensure we always have the default feeds
        rssFeeds.value = [...defaultFeeds]
      }
    } catch (error) {
      console.error('Failed to load RSS feeds:', error)
      // Fallback to default feeds
      rssFeeds.value = [...defaultFeeds]
    }
  }

  const saveFeeds = async () => {
    try {
      await storage.set(STORAGE_KEY, rssFeeds.value)
    } catch (error) {
      console.error('Failed to save RSS feeds:', error)
    }
  }

  const loadActiveFeed = async () => {
    try {
      const stored = await storage.get<string>(ACTIVE_FEED_KEY)
      if (
        stored &&
        rssFeeds.value &&
        Array.isArray(rssFeeds.value) &&
        rssFeeds.value.some((feed) => feed.id === stored)
      ) {
        activeFeedId.value = stored
      }
    } catch (error) {
      console.error('Failed to load active feed:', error)
    }
  }

  const saveActiveFeed = async () => {
    try {
      await storage.set(ACTIVE_FEED_KEY, activeFeedId.value)
    } catch (error) {
      console.error('Failed to save active feed:', error)
    }
  }

  const addFeed = async (name: string, url: string) => {
    const id = `feed-${Date.now()}`
    const newFeed: IRssFeed = {
      id,
      name,
      url,
      isActive: false,
      enabled: true,
    }

    rssFeeds.value.push(newFeed)
    await saveFeeds()
    return newFeed
  }

  const removeFeed = async (id: string) => {
    rssFeeds.value = rssFeeds.value.filter((feed: IRssFeed) => feed.id !== id)

    // If removing active feed, switch to first available
    if (activeFeedId.value === id && rssFeeds.value.length > 0) {
      activeFeedId.value = rssFeeds.value[0].id
      await saveActiveFeed()
    }

    await saveFeeds()
  }

  const setActiveFeed = async (id: string) => {
    const feed = rssFeeds.value.find((f: IRssFeed) => f.id === id)
    if (feed) {
      // Deactivate all feeds
      rssFeeds.value.forEach((f: IRssFeed) => (f.isActive = false))
      // Activate selected feed
      feed.isActive = true
      activeFeedId.value = id

      await saveFeeds()
      await saveActiveFeed()
    }
  }

  const toggleFeed = async (id: string) => {
    const feed = rssFeeds.value.find((f: IRssFeed) => f.id === id)
    if (feed) {
      feed.enabled = !feed.enabled
      await saveFeeds()
    }
  }

  const updateFeedStatus = async (id: string, status: Partial<IRssFeed>) => {
    const feed = rssFeeds.value.find((f: IRssFeed) => f.id === id)
    if (feed) {
      Object.assign(feed, status)
      await saveFeeds()
    }
  }

  const getActiveFeed = () => {
    return rssFeeds.value.find((feed) => feed.id === activeFeedId.value)
  }

  const testFeed = async (feedId: string): Promise<boolean> => {
    const feed = rssFeeds.value.find((f: IRssFeed) => f.id === feedId)
    if (!feed) return false

    try {
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(feed.url)}`)
      const data = await response.json()

      if (data.contents) {
        // Try to parse as RSS
        const parser = new DOMParser()
        const doc = parser.parseFromString(data.contents, 'text/xml')

        // Check if it's valid RSS
        const rssItems = doc.querySelectorAll('item')
        const isValid = rssItems.length > 0

        // Update feed status
        await updateFeedStatus(feedId, {
          lastUpdated: new Date().toISOString(),
          error: isValid ? undefined : 'Invalid RSS format',
        })

        return isValid
      }

      await updateFeedStatus(feedId, {
        lastUpdated: new Date().toISOString(),
        error: 'No content received',
      })
      return false
    } catch (error) {
      console.error('Feed test failed:', error)
      await updateFeedStatus(feedId, {
        lastUpdated: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      return false
    }
  }

  // Return computed values for template
  const feeds = rssFeeds
  const isLoading = ref(false)

  const resetToDefaults = async () => {
    rssFeeds.value = defaultFeeds
    activeFeedId.value = 'everyday-news'
    await saveFeeds()
    await saveActiveFeed()
  }

  const init = async () => {
    await loadFeeds()
    await loadActiveFeed()
  }

  return {
    feeds,
    activeFeedId,
    isLoading,
    init,
    addFeed,
    removeFeed,
    setActiveFeed,
    toggleFeed,
    updateFeedStatus,
    getActiveFeed,
    testFeed,
    resetToDefaults,
  }
}
