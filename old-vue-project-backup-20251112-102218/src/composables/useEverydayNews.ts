import { ref, computed } from 'vue'
import { EverydayNewsService } from '../services/EverydayNewsService'
import { RssNewsService } from '../services/RssNewsService'
import { useRssFeeds } from './useRssFeeds'
import type { IEverydayNews } from '../types'

// Standard composable function. A new state will be created for each component instance.
export const useEverydayNews = () => {
  const { getActiveFeed } = useRssFeeds()
  const everydayNewsService = ref<EverydayNewsService>(new EverydayNewsService())
  const rssNewsService = ref<RssNewsService>(new RssNewsService())
  const newsData = ref<IEverydayNews | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const usingRssService = ref(false)

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

  const fetchTodayNews = async () => {
    loading.value = true
    error.value = null
    usingRssService.value = false

    try {
      const activeFeed = getActiveFeed()

      if (activeFeed) {
        // Try RSS news service first (with preloader support)
        console.log('Attempting to fetch from RSS feed:', activeFeed.name)
        const rssData = await rssNewsService.value.getNewsFromFeed(activeFeed)

        if (rssData) {
          newsData.value = rssData
          usingRssService.value = true
          console.log('Successfully fetched news using RSS service with preloader')
          return
        }

        // Fallback to EverydayNewsService
        console.log('RSS service failed, falling back to EverydayNewsService')
        everydayNewsService.value = new EverydayNewsService(activeFeed.url)
      } else {
        // Use default service if no active feed
        everydayNewsService.value = new EverydayNewsService()
      }

      const data = await everydayNewsService.value.getTodayNewsWithFallback()
      newsData.value = data
      if (!data) {
        error.value = activeFeed ? `无法从 ${activeFeed.name} 获取新闻` : '无法获取今日新闻'
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取新闻时发生错误'
      console.error('Failed to fetch news:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchNewsForDate = async (date: Date) => {
    loading.value = true
    error.value = null
    usingRssService.value = false

    try {
      const activeFeed = getActiveFeed()

      if (activeFeed) {
        // Try RSS news service first
        const rssData = await rssNewsService.value.getNewsForDate(activeFeed, date)

        if (rssData) {
          newsData.value = rssData
          usingRssService.value = true
          return
        }
      }

      // Fallback to EverydayNewsService
      const data = await everydayNewsService.value.getNewsForDate(date)
      newsData.value = data
      if (!data) {
        error.value = '该日期暂无新闻数据'
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取新闻时发生错误'
      console.error('Failed to fetch news for date:', err)
    } finally {
      loading.value = false
    }
  }

  // The init logic is now part of the composable's setup.
  // It will run when a component using this composable is mounted.
  const init = async () => {
    await fetchTodayNews()
  }

  return {
    newsData,
    loading,
    error,
    hasNews,
    formattedDate,
    newsItems,
    usingRssService,
    init, // Expose init to be called from the component
    fetchNewsForDate,
    fetchTodayNews,
  }
}
