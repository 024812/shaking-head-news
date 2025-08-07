import { ref, computed } from 'vue'
import { EverydayNewsService } from '../services/EverydayNewsService'
import type { IEverydayNews } from '../types'
import { storage } from '../helpers/storage'

const DATA_SOURCE_KEY = 'setting.dataSource'

// Standard composable function. A new state will be created for each component instance.
export const useEverydayNews = () => {
  const everydayNewsService = ref<EverydayNewsService>(new EverydayNewsService())
  const newsData = ref<IEverydayNews | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

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
    try {
      const data = await everydayNewsService.value.getTodayNewsWithFallback()
      newsData.value = data
      if (!data) {
        error.value = '无法获取今日新闻'
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
    try {
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
    const customDataSource = await storage.getItem(DATA_SOURCE_KEY)
    if (customDataSource) {
      everydayNewsService.value = new EverydayNewsService(customDataSource)
    }
    await fetchTodayNews()
  }

  return {
    newsData,
    loading,
    error,
    hasNews,
    formattedDate,
    newsItems,
    init, // Expose init to be called from the component
    fetchNewsForDate,
    fetchTodayNews,
  }
}
