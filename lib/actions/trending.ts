'use server'

import { fetchTrending, TrendingItem } from '@/lib/api/trending'

export async function getTrending(source: string): Promise<TrendingItem[]> {
  const data = await fetchTrending(source)
  return data || []
}
