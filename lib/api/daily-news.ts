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

export async function fetchDailyNews(): Promise<DailyNewsItem | null> {
  try {
    const res = await fetch(`${BASE_URL}/60s?encoding=json`, {
      next: { revalidate: 1800 }, // Cache for 30 minutes via native fetch cache
    })
    if (!res.ok) throw new Error('Failed to fetch daily news')
    const json: VikiResponse<DailyNewsItem> = await res.json()
    return json.data
  } catch (error) {
    console.error('Error fetching daily news:', error)
    return null
  }
}

export async function fetchAiNews(): Promise<AiNewsItem[] | null> {
  try {
    const res = await fetch(`${BASE_URL}/ai-news`, {
      next: { revalidate: 1800 }, // Cache for 30 minutes via native fetch cache
    })
    if (!res.ok) throw new Error('Failed to fetch AI news')
    const json: VikiResponse<{ date: string; news: AiNewsItem[] }> = await res.json()
    return json.data.news
  } catch (error) {
    console.error('Error fetching AI news:', error)
    return null
  }
}
