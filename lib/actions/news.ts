'use server'

import { cache } from 'react'
import { revalidateTag } from 'next/cache'
import {
  RawNewsResponseSchema,
  NewsItemSchema,
  type NewsItem,
  type NewsResponse,
} from '@/types/news'
import { z } from 'zod'
import { logError, validateOrThrow } from '@/lib/utils/error-handler'
import { NewsAPIError } from '@/lib/errors/news-error'
import { XMLParser } from 'fast-xml-parser'
import { auth } from '@/lib/auth'
import { getRSSSources } from '@/lib/actions/rss'

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
    await new Promise<void>((resolve) => setTimeout(resolve, delay))

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
export const getNews = cache(async (language: 'zh' | 'en' = 'zh', source?: string) => {
  const url = source
    ? `${NEWS_API_BASE_URL}/${source}.json?lang=${language}`
    : `${NEWS_API_BASE_URL}/latest.json?lang=${language}`

  try {
    const response = await retryWithBackoff(async () => {
      const res = await fetch(url, {
        next: {
          revalidate: DEFAULT_REVALIDATE,
          tags: ['news', `news-${language}`, source ? `news-${source}` : 'news-latest'],
        },
        // Enable stale-while-revalidate for better performance
        cache: 'force-cache',
      })

      if (!res.ok) {
        throw new NewsAPIError(`Failed to fetch news: ${res.statusText}`, res.status, source)
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
      throw new NewsAPIError('Invalid news data format received from API', 500, source)
    }

    throw new NewsAPIError('Failed to fetch news. Please try again later.', 500, source)
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
      revalidateTag(`news-${source}`, { expire: 0 })
    } else if (language) {
      // Refresh specific language
      revalidateTag(`news-${language}`, { expire: 0 })
    } else {
      // Refresh all news
      revalidateTag('news', { expire: 0 })
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
 * Get news for the home page
 * Prioritizes user's RSS sources if available
 */
export async function getHomePageNews(language: 'zh' | 'en' = 'zh', source?: string) {
  try {
    // If a specific source is requested, just get that
    if (source) {
      return getNews(language, source)
    }

    // Check for user RSS sources
    const session = await auth()
    if (session?.user?.id) {
      const rssSources = await getRSSSources()

      if (rssSources.length > 0) {
        // Fetch all enabled RSS feeds in parallel
        const enabledSources = rssSources.filter((s) => s.enabled !== false)

        if (enabledSources.length > 0) {
          const results = await Promise.allSettled(enabledSources.map((s) => getRSSNews(s.url)))

          const allItems: NewsItem[] = []

          results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
              // Add source name to items if not present
              const itemsWithSource = result.value.map((item) => ({
                ...item,
                source: item.source || enabledSources[index].name,
              }))
              allItems.push(...itemsWithSource)
            } else {
              console.error(
                `Failed to fetch RSS source ${enabledSources[index].url}:`,
                result.reason
              )
            }
          })

          if (allItems.length > 0) {
            // Sort by date descending
            allItems.sort(
              (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
            )

            return {
              items: allItems,
              total: allItems.length,
              updatedAt: new Date().toISOString(),
            }
          }
        }
      }
    }

    // Fallback to default API news
    return getNews(language, source)
  } catch (error) {
    console.error('Error in getHomePageNews:', error)
    // Fallback to default API news on error
    return getNews(language, source)
  }
}

/**
 * Parse RSS feed XML to NewsItem array
 */
/**
 * Parse RSS feed XML to NewsItem array using fast-xml-parser
 */
function parseRSSFeed(xml: string, sourceUrl: string): NewsItem[] {
  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    })
    const result = parser.parse(xml)

    const channel = result.rss?.channel || result.feed
    const items = channel?.item || channel?.entry || []

    // Handle single item case (fast-xml-parser might return object instead of array for single item)
    const itemsArray = Array.isArray(items) ? items : [items]

    const newsItems: NewsItem[] = []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    itemsArray.forEach((item: any, index: number) => {
      try {
        // Extract fields with fallbacks for different RSS/Atom formats
        const title = item.title || 'Untitled'
        const link = item.link || item.guid || ''
        // Handle Atom link object
        const url = typeof link === 'object' && link['@_href'] ? link['@_href'] : link

        let description = item.description || item.summary || item.content || ''
        // Handle Atom content object
        if (typeof description === 'object' && description['#text']) {
          description = description['#text']
        }

        const pubDate = item.pubDate || item.published || item.updated || new Date().toISOString()
        const guid = item.guid || item.id || url

        // Ensure description is a string
        if (typeof description !== 'string') {
          // Try to handle other object formats or fallback to empty string
          if (typeof description === 'number') {
            description = String(description)
          } else {
            description = ''
          }
        }

        // Try to extract image
        let imageUrl: string | undefined
        if (item.enclosure && item.enclosure['@_type']?.startsWith('image')) {
          imageUrl = item.enclosure['@_url']
        } else if (item['media:content'] && item['media:content']['@_url']) {
          imageUrl = item['media:content']['@_url']
        } else if (item['media:group'] && item['media:group']['media:content']) {
          const mediaContent = item['media:group']['media:content']
          imageUrl = Array.isArray(mediaContent) ? mediaContent[0]['@_url'] : mediaContent['@_url']
        } else {
          // Try to extract from description HTML
          const imgMatch = description.match(/<img.*?src="(.*?)".*?>/)
          if (imgMatch) {
            imageUrl = imgMatch[1]
          }
        }

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

        const newsItem = validateOrThrow(NewsItemSchema, {
          id: typeof guid === 'object' ? guid['#text'] || `${sourceUrl}-${index}` : guid,
          title: typeof title === 'object' ? title['#text'] || 'Untitled' : title.trim(),
          description: cleanDescription || undefined,
          url: typeof url === 'string' ? url.trim() : '',
          source: sourceUrl,
          publishedAt: isoDate,
          imageUrl: imageUrl || undefined,
        })

        newsItems.push(newsItem)
      } catch (error) {
        // Skip invalid items but log for debugging
        logError(error, {
          action: 'parseRSSFeed',
          sourceUrl,
          itemIndex: index,
        })
      }
    })

    return newsItems
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
          tags: ['rss', `rss-${rssUrl}`],
        },
        headers: {
          'User-Agent': 'ShakingHeadNews/1.0',
        },
        // Enable stale-while-revalidate for RSS feeds
        cache: 'force-cache',
      })

      if (!res.ok) {
        throw new NewsAPIError(`Failed to fetch RSS feed: ${res.statusText}`, res.status, rssUrl)
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
    revalidateTag(`rss-${rssUrl}`, { expire: 0 })
    return { success: true }
  } catch (error) {
    logError(error, {
      action: 'refreshRSSFeed',
      rssUrl,
    })
    throw new NewsAPIError('Failed to refresh RSS feed cache')
  }
}
