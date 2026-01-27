export interface HotItem {
  title: string
  url: string
  hot?: string
}

export interface HotListResponse {
  code: number
  msg: string
  data: HotItem[]
  time: string
}

export const HOT_LIST_SOURCES = [
  { id: 'douyin', name: '抖音热搜', icon: '🎵' },
  { id: 'weibo', name: '微博热搜', icon: '🔴' },
  { id: 'bilibili', name: 'B站热搜', icon: '📺' },
  { id: 'zhihu', name: '知乎热榜', icon: '❓' },
  { id: 'baidu', name: '百度热搜', icon: '🔍' },
  { id: 'toutiao', name: '头条热榜', icon: '📰' },
  // { id: 'juejin', name: '掘金热榜', icon: '💎' },
  // { id: 'netease', name: '网易新闻', icon: '📰' },
] as const

export type HotListSourceId = (typeof HOT_LIST_SOURCES)[number]['id']

const API_PATH_MAP: Record<string, string> = {
  baidu: 'baidu/hot',
  bilibili: 'bili',
  juejin: 'juejin', // Still might be wrong, verify later?
  netease: 'netease', // Still might be wrong
}

export async function getHotList(sourceId: string): Promise<HotItem[]> {
  try {
    const apiPath = API_PATH_MAP[sourceId] || sourceId
    const res = await fetch(`https://60s.viki.moe/v2/${apiPath}`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch ${sourceId} hot list`)
    }

    const data: HotListResponse = await res.json()
    return data.data || []
  } catch (error) {
    console.error(`Error fetching hot list for ${sourceId}:`, error)
    return []
  }
}
