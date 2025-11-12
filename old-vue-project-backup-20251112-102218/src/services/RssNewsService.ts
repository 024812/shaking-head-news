import { newsPreloader, type INewsItem } from './NewsPreloader'
import { cacheManager } from './CacheManager'
import { AdvancedRssParser } from './RssParser'
import type { IRssFeed } from '../composables/useRssFeeds'
import type { IEverydayNews } from '../types'

export class RssNewsService {
  private parser: AdvancedRssParser
  private cacheTTL: number = 30 * 60 * 1000 // 30 minutes

  constructor() {
    this.parser = new AdvancedRssParser({
      maxItems: 50,
      minContentLength: 10,
      stripHtml: true,
      sanitizeContent: true,
      extractImages: false,
      timeout: 30000,
    })
  }

  /**
   * Get news from RSS feed with preloader support
   */
  async getNewsFromFeed(feed: IRssFeed): Promise<IEverydayNews | null> {
    const cacheKey = `rss-news:${feed.id}`

    // Try cache first
    const cached = cacheManager.get<IEverydayNews>(cacheKey)
    if (cached) {
      console.log(`Using cached RSS news for: ${feed.name}`)
      return cached
    }

    // Try preloader cache
    const preloaded = await newsPreloader.getCachedNews(feed.id)
    if (preloaded && preloaded.length > 0) {
      const newsData = this.convertToEverydayNews(preloaded)
      cacheManager.set(cacheKey, newsData, this.cacheTTL)
      console.log(`Using preloaded RSS news for: ${feed.name}`)
      return newsData
    }

    // Fetch fresh data
    try {
      console.log(`Fetching fresh RSS news for: ${feed.name}`)
      const rssData = await this.parser.parseFeed(feed.url, feed.url)

      if (rssData && rssData.items.length > 0) {
        const newsData = this.convertToEverydayNews(rssData.items)
        cacheManager.set(cacheKey, newsData, this.cacheTTL)

        // Trigger preloader for next time
        newsPreloader.preloadNow([feed.id]).catch(console.error)

        return newsData
      }
    } catch (error) {
      console.error(`Failed to fetch RSS news from ${feed.name}:`, error)
    }

    return null
  }

  /**
   * Convert RSS items to EverydayNews format
   */
  private convertToEverydayNews(items: INewsItem[]): IEverydayNews {
    // Take first 16 items and convert to simple text format
    const content = items
      .slice(0, 16)
      .map((item, index) => {
        // Clean up the title and add numbering
        const title = item.title
          .replace(/<[^>]*>/g, '') // Remove HTML tags
          .replace(/^\s+|\s+$/g, '') // Trim whitespace
          .replace(/\n+/g, ' ') // Replace newlines with spaces

        return `${index + 1}. ${title}`
      })
      .filter(Boolean) // Remove empty items

    return {
      date: new Date().toLocaleDateString('en-CA'),
      content,
    }
  }

  /**
   * Get news for a specific date from RSS
   */
  async getNewsForDate(feed: IRssFeed, _date: Date): Promise<IEverydayNews | null> {
    void _date
    // For RSS feeds, we typically only have the latest news
    // This is a simplified implementation that just gets current news
    const news = await this.getNewsFromFeed(feed)

    if (news && news.content.length > 0) {
      // You could add more sophisticated date filtering here
      return news
    }

    return null
  }

  /**
   * Clear cache for a specific feed
   */
  clearFeedCache(feedId: string): void {
    const cacheKey = `rss-news:${feedId}`
    cacheManager.delete(cacheKey)
  }

  /**
   * Clear all RSS news cache
   */
  clearAllCache(): void {
    // This would require iterating through all cache keys
    // For now, we'll rely on cacheManager's automatic cleanup
    console.log('RSS news cache will be cleared automatically by cache manager')
  }
}
