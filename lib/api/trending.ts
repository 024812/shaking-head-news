export interface TrendingItem {
  title: string
  url: string // normalized link
  hot?: string | number // heat/view count
  icon?: string
}

interface VikiResponse<T> {
  code: number
  message: string
  data: T[]
}

const BASE_URL = 'https://60s.viki.moe/v2'

interface RawTrendingItem {
  title?: string
  keyword?: string
  url?: string
  link?: string
  hot?: string | number
  heat?: string | number
  score?: string | number
}

export async function fetchTrending(source: string = 'douyin'): Promise<TrendingItem[] | null> {
  try {
    const endpoint = `${BASE_URL}/${source}`
    const res = await fetch(endpoint, {
      next: { revalidate: 60 }, // Cache for 1 minute via native fetch cache
    })
    if (!res.ok) throw new Error(`Failed to fetch trending ${source}`)

    const json: VikiResponse<RawTrendingItem> = await res.json()

    if (json.code !== 200 || !Array.isArray(json.data)) return null

    return json.data.map((item) => ({
      title: item.title || item.keyword || 'Unknown',
      url: item.url || item.link || '#',
      hot: item.hot || item.heat || item.score || undefined,
    }))
  } catch (error) {
    console.error(`Error fetching trending ${source}:`, error)
    return null
  }
}
