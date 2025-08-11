import { ref, onMounted } from 'vue'
import { storage } from '../helpers/storage'
import { EverydayNewsService } from '../services/EverydayNewsService'
import { useNotifications } from './useNotifications'

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
  const { success, error: showError, warning, info } = useNotifications()

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
    // Validate input
    if (!name.trim()) {
      showError('添加失败', 'RSS源名称不能为空')
      throw new Error('RSS源名称不能为空')
    }
    
    if (!url.trim()) {
      showError('添加失败', 'RSS源地址不能为空')
      throw new Error('RSS源地址不能为空')
    }

    // Check for duplicate URL
    if (feeds.value.some(feed => feed.url.trim() === url.trim())) {
      showError('添加失败', '该RSS源已存在')
      throw new Error('该RSS源已存在')
    }

    const newFeed: IRssFeed = {
      id: generateId(),
      name: name.trim(),
      url: url.trim(),
      enabled: true,
    }
    
    feeds.value.push(newFeed)
    saveFeeds()
    success('RSS源添加成功', `已添加 "${name.trim()}"`)
    return newFeed
  }

  const removeFeed = (feedId: string) => {
    const feed = feeds.value.find((f) => f.id === feedId)
    if (!feed) {
      warning('删除失败', '找不到指定的RSS源')
      return
    }

    const index = feeds.value.findIndex((f) => f.id === feedId)
    if (index > -1) {
      const feedName = feed.name
      feeds.value.splice(index, 1)
      
      // If removing the active feed, switch to the first available
      if (activeFeedId.value === feedId && feeds.value.length > 0) {
        const newActiveFeed = feeds.value.find(f => f.enabled) || feeds.value[0]
        activeFeedId.value = newActiveFeed.id
        storage.setItem(ACTIVE_FEED_KEY, activeFeedId.value)
        info('活跃源已切换', `已切换到 "${newActiveFeed.name}"`)
      }
      
      saveFeeds()
      success('RSS源删除成功', `已删除 "${feedName}"`)
    }
  }

  const toggleFeed = (feedId: string) => {
    const feed = feeds.value.find((f) => f.id === feedId)
    if (feed) {
      const wasEnabled = feed.enabled
      feed.enabled = !feed.enabled
      saveFeeds()
      
      if (feed.enabled) {
        success('RSS源已启用', `"${feed.name}" 现在可以使用`)
      } else {
        warning('RSS源已禁用', `"${feed.name}" 已被禁用`)
        
        // If disabling the active feed, switch to another enabled feed
        if (activeFeedId.value === feedId) {
          const enabledFeed = feeds.value.find(f => f.enabled && f.id !== feedId)
          if (enabledFeed) {
            activeFeedId.value = enabledFeed.id
            storage.setItem(ACTIVE_FEED_KEY, activeFeedId.value)
            info('活跃源已切换', `已自动切换到 "${enabledFeed.name}"`)
          } else {
            showError('无可用RSS源', '所有RSS源都已被禁用，请启用至少一个RSS源')
          }
        }
      }
    }
  }

  const setActiveFeed = (feedId: string) => {
    const feed = feeds.value.find((f) => f.id === feedId)
    if (feed && feed.enabled) {
      const previousFeed = feeds.value.find(f => f.id === activeFeedId.value)
      activeFeedId.value = feedId
      storage.setItem(ACTIVE_FEED_KEY, feedId)
      
      if (previousFeed && previousFeed.id !== feedId) {
        success('RSS源切换成功', `已切换到 "${feed.name}"`)
      }
    } else if (feed && !feed.enabled) {
      warning('无法切换', `"${feed.name}" 已被禁用`)
    } else {
      showError('切换失败', '找不到指定的RSS源')
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
    if (!feed) {
      showError('测试失败', '找不到指定的RSS源')
      return false
    }

    isLoading.value = true
    error.value = null
    info('正在测试RSS源...', `检查 "${feed.name}" 是否可访问`)

    try {
      const validation = await validateFeedUrl(feed.url)
      if (validation.valid) {
        feed.error = undefined
        feed.lastUpdated = new Date().toISOString()
        success('RSS源测试成功', `"${feed.name}" 可以正常访问`)
      } else {
        feed.error = validation.error || 'Feed validation failed'
        showError('RSS源测试失败', `"${feed.name}": ${feed.error}`, {
          actions: [{
            label: '重新测试',
            action: () => testFeed(feedId),
            primary: true
          }]
        })
      }
      saveFeeds()
      return validation.valid
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Test failed'
      feed.error = errorMsg
      showError('RSS源测试出错', `"${feed.name}": ${errorMsg}`, {
        actions: [{
          label: '重新测试',
          action: () => testFeed(feedId),
          primary: true
        }]
      })
      saveFeeds()
      return false
    } finally {
      isLoading.value = false
    }
  }

  const saveFeeds = async () => {
    try {
      await storage.setItem(RSS_FEEDS_KEY, JSON.stringify(feeds.value))
    } catch (err) {
      console.error('Failed to save RSS feeds:', err)
      showError('保存失败', '无法保存RSS源设置，请稍后重试')
    }
  }

  const loadFeeds = async () => {
    try {
      const stored = await storage.getItem(RSS_FEEDS_KEY)
      const storedActiveFeed = await storage.getItem(ACTIVE_FEED_KEY)

      if (stored) {
        const parsed = JSON.parse(stored) as IRssFeed[]
        feeds.value = parsed
        info('RSS源加载成功', `已加载 ${parsed.length} 个RSS源`)
      } else {
        // Initialize with default feeds
        feeds.value = [...defaultFeeds]
        await saveFeeds()
        success('初始化RSS源', `已添加 ${defaultFeeds.length} 个默认RSS源`)
      }

      // Set active feed
      if (storedActiveFeed && feeds.value.some((f) => f.id === storedActiveFeed)) {
        activeFeedId.value = storedActiveFeed
      } else if (feeds.value.length > 0) {
        const enabledFeed = feeds.value.find(f => f.enabled) || feeds.value[0]
        activeFeedId.value = enabledFeed.id
        await storage.setItem(ACTIVE_FEED_KEY, activeFeedId.value)
      }
    } catch (err) {
      console.warn('Failed to load RSS feeds:', err)
      showError('加载RSS源失败', '使用默认RSS源，请检查设置', {
        actions: [{
          label: '重新加载',
          action: loadFeeds,
          primary: true
        }]
      })
      
      // Fallback to default feeds
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
