'use server'

import { cache } from 'react'
import { revalidateTag } from 'next/cache'
import { 
  RawNewsResponseSchema,
  NewsResponseSchema, 
  type NewsItem,
  type NewsResponse 
} from '@/types/news'
import { z } from 'zod'
import { logError, validateOrThrow } from '@/lib/utils/error-handler'
import { NewsAPIError } from '@/lib/errors/news-error'

// Configuration
const NEWS_API_BASE_URL = process.env.NEWS_API_BASE_URL || 'https://news.ravelloh.top'
const DEFAULT_REVALIDATE = 3600 // 1 hour - optimized for ISR
const RSS_REVALIDATE = 1800 // 30 minutes - faster updates for RSS
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

/**
 * Retry helper function with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRIES,
  delay: number = RETRY_DELAY
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (retries <= 0) {
      throw error
    }
    
    // Wait with exponential backoff
    await new Promise<void>(resolve => setTimeout(resolve, delay))
    
    // Retry with increased delay
    return retryWithBackoff(fn, retries - 1, delay * 2)
  }
}

/**
 * Get news from the API with ISR caching
 * 
 * @param language - Language for news content ('zh' or 'en')
 * @param source - Optional specific news source
 * @returns News response with items
 */
export const getNews = cache(async (
  language: 'zh' | 'en' = 'zh',
  source?: string
) => {
  const url = source 
    ? `${NEWS_API_BASE_URL}/${source}.json?lang=${language}`
    : `${NEWS_API_BASE_URL}/latest.json?lang=${language}`
  
  try {
    const response = await retryWithBackoff(async () => {
      const res = await fetch(url, {
        next: {
          revalidate: DEFAULT_REVALIDATE,
          tags: [
            'news',
            `news-${language}`,
            source ? `news-${source}` : 'news-latest'
          ]
        },
        // Enable stale-while-revalidate for better performance
        cache: 'force-cache',
      })
      
      if (!res.ok) {
        throw new NewsAPIError(
          `Failed to fetch news: ${res.statusText}`,
          res.status,
          source
        )
      }
      
      return res
    })
    
    const rawData = await response.json()
    
    // Validate raw response data
    const validatedRawData = validateOrThrow(RawNewsResponseSchema, rawData)
    
    // Transform to our format
    const items: NewsItem[] = validatedRawData.content.map((title, index) => ({
      id: `${validatedRawData.date}-${index}`,
      title,
      source: source || 'everydaynews',
      publishedAt: validatedRawData.date,
    }))
    
    const transformedData: NewsResponse = {
      items,
      total: items.length,
      updatedAt: new Date().toISOString(),
    }
    
    return transformedData
  } catch (error) {
    // Log error for monitoring
    logError(error, {
      action: 'getNews',
      url,
      language,
      source,
    })
    
    // Re-throw with context
    if (error instanceof NewsAPIError) {
      throw error
    }
    
    if (error instanceof z.ZodError) {
      throw new NewsAPIError(
        'Invalid news data format received from API',
        500,
        source
      )
    }
    
    throw new NewsAPIError(
      'Failed to fetch news. Please try again later.',
      500,
      source
    )
  }
})

/**
 * Manually refresh news cache
 * 
 * @param language - Optional language to refresh
 * @param source - Optional specific source to refresh
 */
export async function refreshNews(language?: 'zh' | 'en', source?: string) {
  try {
    if (source) {
      // Refresh specific source
      revalidateTag(`news-${source}`)
    } else if (language) {
      // Refresh specific language
      revalidateTag(`news-${language}`)
    } else {
      // Refresh all news
      revalidateTag('news')
    }
    
    return { success: true }
  } catch (error) {
    logError(error, {
      action: 'refreshNews',
      language,
      source,
    })
    throw new NewsAPIError('Failed to refresh news cache')
  }
}

/**
 * Parse RSS feed XML to NewsItem array
 */
function parseRSSFeed(xml: string, sourceUrl: string): NewsItem[] {
  try {
    // Simple RSS parser (for production, consider using a library like 'fast-xml-parser')
    const items: NewsItem[] = []
    
    // Extract items using regex (basic implementation)
    const itemRegex = /<item>([\s\S]*?)<\/item>/g
    const matches = xml.matchAll(itemRegex)
    
    for (const match of matches) {
      const itemXml = match[1]
      
      // Extract fields
      const title = itemXml.match(/<title>(.*?)<\/title>/)?.[1] || ''
      const link = itemXml.match(/<link>(.*?)<\/link>/)?.[1] || ''
      const description = itemXml.match(/<description>(.*?)<\/description>/)?.[1] || ''
      const pubDate = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || new Date().toISOString()
      const guid = itemXml.match(/<guid.*?>(.*?)<\/guid>/)?.[1] || link
      
      // Try to extract image from description or enclosure
      let imageUrl: string | undefined
      const enclosureMatch = itemXml.match(/<enclosure.*?url="(.*?)".*?\/>/)?.[1]
      const imgMatch = description.match(/<img.*?src="(.*?)".*?>/)?.[1]
      imageUrl = enclosureMatch || imgMatch
      
      // Clean HTML from description
      const cleanDescription = description
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .trim()
      
      // Convert pubDate to ISO format
      let isoDate: string
      try {
        isoDate = new Date(pubDate).toISOString()
      } catch {
        isoDate = new Date().toISOString()
      }
      
      // Validate and add item
      try {
        const newsItem = validateOrThrow(NewsItemSchema, {
          id: guid || `${sourceUrl}-${items.length}`,
          title: title.trim(),
          description: cleanDescription || undefined,
          url: link.trim(),
          source: sourceUrl,
          publishedAt: isoDate,
          imageUrl: imageUrl || undefined,
        })
        
        items.push(newsItem)
      } catch (error) {
        // Skip invalid items but log for debugging
        logError(error, {
          action: 'parseRSSFeed',
          sourceUrl,
          itemIndex: items.length,
        })
      }
    }
    
    return items
  } catch (error) {
    logError(error, {
      action: 'parseRSSFeed',
      sourceUrl,
    })
    throw new NewsAPIError('Failed to parse RSS feed')
  }
}

/**
 * Get news from RSS feed
 * 
 * @param rssUrl - URL of the RSS feed
 * @returns Array of news items
 */
export async function getRSSNews(rssUrl: string): Promise<NewsItem[]> {
  try {
    const response = await retryWithBackoff(async () => {
      const res = await fetch(rssUrl, {
        next: {
          revalidate: RSS_REVALIDATE,
          tags: ['rss', `rss-${rssUrl}`]
        },
        headers: {
          'User-Agent': 'ShakingHeadNews/1.0',
        },
        // Enable stale-while-revalidate for RSS feeds
        cache: 'force-cache',
      })
      
      if (!res.ok) {
        throw new NewsAPIError(
          `Failed to fetch RSS feed: ${res.statusText}`,
          res.status,
          rssUrl
        )
      }
      
      return res
    })
    
    const xml = await response.text()
    
    // Parse RSS XML
    const items = parseRSSFeed(xml, rssUrl)
    
    if (items.length === 0) {
      throw new NewsAPIError('No valid items found in RSS feed', 404, rssUrl)
    }
    
    return items
  } catch (error) {
    logError(error, {
      action: 'getRSSNews',
      rssUrl,
    })
    
    if (error instanceof NewsAPIError) {
      throw error
    }
    
    throw new NewsAPIError(
      'Failed to fetch RSS feed. Please check the URL and try again.',
      500,
      rssUrl
    )
  }
}

/**
 * Refresh RSS feed cache
 * 
 * @param rssUrl - URL of the RSS feed to refresh
 */
export async function refreshRSSFeed(rssUrl: string) {
  try {
    revalidateTag(`rss-${rssUrl}`)
    return { success: true }
  } catch (error) {
    logError(error, {
      action: 'refreshRSSFeed',
      rssUrl,
    })
    throw new NewsAPIError('Failed to refresh RSS feed cache')
  }
}
