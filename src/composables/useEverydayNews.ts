import { ref, computed, onMounted } from 'vue'
import { EverydayNewsService } from '../services/EverydayNewsService'
import { useRssFeeds } from './useRssFeeds'
import { useNewsCache } from './useNewsCache'
import { useNotifications } from './useNotifications'
import type { IEverydayNews } from '../types'

// Standard composable function. A new state will be created for each component instance.
export const useEverydayNews = () => {
  const { getActiveFeed } = useRssFeeds()
  const { getCachedNews, setCachedNews, needsBackgroundRefresh, loadCache } = useNewsCache()
  const { success, error: showError, warning, info } = useNotifications()
  
  const everydayNewsService = ref<EverydayNewsService>(new EverydayNewsService())
  const newsData = ref<IEverydayNews | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const isFromCache = ref(false)
  const retryCount = ref(0)
  const maxRetries = 3

  const hasNews = computed(() => newsData.value && newsData.value.content.length > 0)

  const formattedDate = computed(() => {
    if (!newsData.value?.date) return ''
    return everydayNewsService.value.formatDateString(newsData.value.date)
  })

  const newsItems = computed(() => {
    if (!newsData.value) return []
    return newsData.value.content.map((item: string, index: number) => ({
      id: index,
      text: item.replace(/^\d+[.、]\s*/, ''), // Remove leading numbers
    }))
  })

  const fetchTodayNews = async (forceRefresh: boolean = false) => {
    const activeFeed = getActiveFeed()
    if (!activeFeed) {
      const errorMsg = '没有可用的新闻源'
      error.value = errorMsg
      showError('新闻加载失败', errorMsg, {
        actions: [{
          label: '打开设置',
          action: () => {
            // This would trigger opening settings - could emit an event
            info('请在设置中添加RSS新闻源')
          }
        }]
      })
      return
    }

    const feedId = activeFeed.id
    const today = new Date().toISOString().split('T')[0]

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cachedNews = getCachedNews(feedId, today)
      if (cachedNews) {
        newsData.value = cachedNews.data
        isFromCache.value = true
        error.value = null
        
        // Show cache notification on first load
        if (retryCount.value === 0) {
          info('已加载缓存内容', '正在后台检查更新...')
        }
        
        // Check if background refresh is needed
        if (needsBackgroundRefresh(feedId, today)) {
          // Refresh in background without showing loading state
          refreshInBackground(feedId, today)
        }
        return
      }
    }

    // Fetch fresh data
    await fetchFreshNews(feedId, today)
  }

  const fetchFreshNews = async (feedId: string, date?: string) => {
    loading.value = true
    error.value = null
    isFromCache.value = false

    try {
      const activeFeed = getActiveFeed()
      if (!activeFeed || activeFeed.id !== feedId) {
        throw new Error('Feed configuration changed')
      }

      // Update service with current feed URL
      everydayNewsService.value = new EverydayNewsService(activeFeed.url)

      const data = await everydayNewsService.value.getTodayNewsWithFallback()
      
      if (data) {
        newsData.value = data
        // Cache the fresh data
        setCachedNews(feedId, data, date)
        
        // Reset retry count on success
        retryCount.value = 0
        
        // Show success notification
        success('新闻更新成功', `已加载 ${data.content.length} 条新闻`)
      } else {
        const errorMsg = `无法从 ${activeFeed.name} 获取新闻`
        error.value = errorMsg
        
        // Offer retry option
        showError('新闻加载失败', errorMsg, {
          actions: [
            {
              label: '重试',
              action: () => retryFetch(feedId, date),
              primary: true
            },
            {
              label: '使用其他源',
              action: () => info('请在设置中切换到其他新闻源')
            }
          ]
        })
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '获取新闻时发生错误'
      error.value = errorMsg
      console.error('Failed to fetch news:', err)
      
      // Show detailed error with retry option
      showError('网络连接错误', errorMsg, {
        actions: [
          {
            label: '重试',
            action: () => retryFetch(feedId, date),
            primary: true
          }
        ]
      })
    } finally {
      loading.value = false
    }
  }

  const retryFetch = async (feedId: string, date?: string) => {
    if (retryCount.value < maxRetries) {
      retryCount.value++
      warning(`重试中... (${retryCount.value}/${maxRetries})`)
      await fetchFreshNews(feedId, date)
    } else {
      showError('重试次数已达上限', '请检查网络连接或稍后再试', {
        actions: [{
          label: '重置重试',
          action: () => {
            retryCount.value = 0
            info('重试次数已重置，您可以再次尝试')
          }
        }]
      })
    }
  }

  const refreshInBackground = async (feedId: string, date?: string) => {
    try {
      const activeFeed = getActiveFeed()
      if (!activeFeed || activeFeed.id !== feedId) return

      const service = new EverydayNewsService(activeFeed.url)
      const data = await service.getTodayNewsWithFallback()
      
      if (data) {
        // Update cache silently
        setCachedNews(feedId, data, date)
        
        // Update displayed data if it's still the same feed
        const currentActiveFeed = getActiveFeed()
        if (currentActiveFeed && currentActiveFeed.id === feedId) {
          newsData.value = data
          isFromCache.value = false
          
          // Show subtle update notification
          success('内容已更新', `后台更新完成，新增 ${data.content.length} 条新闻`)
        }
      }
    } catch (err) {
      console.warn('Background refresh failed:', err)
      // Don't show error notifications for background refresh failures
    }
  }

  const fetchNewsForDate = async (date: Date, forceRefresh: boolean = false) => {
    const activeFeed = getActiveFeed()
    if (!activeFeed) {
      const errorMsg = '没有可用的新闻源'
      error.value = errorMsg
      showError('新闻加载失败', errorMsg)
      return
    }

    const feedId = activeFeed.id
    const dateString = date.toISOString().split('T')[0]

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cachedNews = getCachedNews(feedId, dateString)
      if (cachedNews) {
        newsData.value = cachedNews.data
        isFromCache.value = true
        error.value = null
        info('已加载历史缓存', `${dateString} 的新闻内容`)
        return
      }
    }

    // Fetch fresh data for specific date
    loading.value = true
    error.value = null
    isFromCache.value = false

    try {
      everydayNewsService.value = new EverydayNewsService(activeFeed.url)
      const data = await everydayNewsService.value.getNewsForDate(date)
      
      if (data) {
        newsData.value = data
        // Cache the fetched data
        setCachedNews(feedId, data, dateString)
        success('历史新闻加载成功', `${dateString} 的新闻内容`)
      } else {
        const errorMsg = '该日期暂无新闻数据'
        error.value = errorMsg
        warning('无新闻数据', errorMsg)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '获取新闻时发生错误'
      error.value = errorMsg
      console.error('Failed to fetch news for date:', err)
      
      showError('获取历史新闻失败', errorMsg, {
        actions: [{
          label: '重试',
          action: () => fetchNewsForDate(date, true),
          primary: true
        }]
      })
    } finally {
      loading.value = false
    }
  }

  // The init logic is now part of the composable's setup.
  // It will run when a component using this composable is mounted.
  const init = async () => {
    try {
      await loadCache()
      await fetchTodayNews()
    } catch (err) {
      console.error('Failed to initialize news:', err)
      showError('初始化失败', '无法加载新闻数据，请检查网络连接')
    }
  }

  // Force refresh current news
  const refresh = async () => {
    info('正在刷新...', '重新获取最新新闻')
    await fetchTodayNews(true)
  }

  // Initialize cache when composable is created
  onMounted(async () => {
    await loadCache()
  })

  return {
    newsData,
    loading,
    error,
    isFromCache,
    hasNews,
    formattedDate,
    newsItems,
    init,
    refresh,
    fetchNewsForDate,
    fetchTodayNews,
    retryCount,
    maxRetries,
  }
}
