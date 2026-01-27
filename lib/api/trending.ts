import { unstable_cache } from 'next/cache'

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
  return unstable_cache(
    async () => {
      try {
        const endpoint = `${BASE_URL}/${source}`
        const res = await fetch(endpoint, {
          // nested fetch cache is redundant if wrapped in unstable_cache, but good for safety
          next: { revalidate: 60 },
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
    },
    [`trending-${source}`], // Dynamic key ensuring separation by source
    { revalidate: 60, tags: ['trending', `trending-${source}`] }
  )()
}
