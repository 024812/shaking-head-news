import { unstable_cache } from 'next/cache'

export interface DailyNewsItem {
  news: string[]
  tip: string
  date: string
  lunar_date: string
  image: string
  cover: string
  link: string // url to original article
  updated: string
  day_of_week: string
}

export interface AiNewsItem {
  title: string
  description: string
  pic: string
  link: string
  source: string
  date: string
}

interface VikiResponse<T> {
  code: number
  message: string
  data: T
}

const BASE_URL = 'https://60s.viki.moe/v2'

export const fetchDailyNews = unstable_cache(
  async (): Promise<DailyNewsItem | null> => {
    try {
      const res = await fetch(`${BASE_URL}/60s?encoding=json`, {
        next: { revalidate: 1800 }, // Cache for 30 minutes
      })
      if (!res.ok) throw new Error('Failed to fetch daily news')
      const json: VikiResponse<DailyNewsItem> = await res.json()
      return json.data
    } catch (error) {
      console.error('Error fetching daily news:', error)
      return null
    }
  },
  ['daily-news-60s'],
  { revalidate: 1800 }
)

export const fetchAiNews = unstable_cache(
  async (): Promise<AiNewsItem[] | null> => {
    try {
      const res = await fetch(`${BASE_URL}/ai-news`, {
        next: { revalidate: 1800 },
      })
      if (!res.ok) throw new Error('Failed to fetch AI news')
      // The API returns { data: { news: [...] } } or just { data: [...] } ?
      // Based on curl output: {"data":{"date":"...","news": [...]}}
      // Let's type it loosely first to be safe, then strict.
      // Wait, let's re-verify the AI structure from previous curl.
      // Output was: {"data":{"date":"2026-01-27","news":[{"title":"...","link":"...","source":"..."}]}}
      const json: VikiResponse<{ date: string; news: AiNewsItem[] }> = await res.json()
      return json.data.news
    } catch (error) {
      console.error('Error fetching AI news:', error)
      return null
    }
  },
  ['daily-news-ai'],
  { revalidate: 1800 }
)
