// Background News Preloader with rate limiting and intelligent caching
import { cacheManager } from './CacheManager'
import { storage } from '../helpers/storage'

export interface INewsItem {
  id: string
  title: string
  description?: string
  content?: string
  url: string
  publishedAt: string
  source: string
  category?: string
  author?: string
  imageUrl?: string
}

export interface IFeedSource {
  id: string
  name: string
  url: string
  type: 'rss' | 'json' | 'api'
  enabled: boolean
  lastUpdated?: string
  error?: string
  rateLimit?: {
    requests: number
    window: number // in milliseconds
  }
}

export interface IPreloaderConfig {
  enabled: boolean
  interval: number // in milliseconds
  maxConcurrentRequests: number
  retryAttempts: number
  retryDelay: number // in milliseconds
  rateLimitBuffer: number // buffer before actual limit
}

export interface IPreloaderStats {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  lastPreloadTime: number | null
  nextPreloadTime: number | null
  averageResponseTime: number
  rateLimitHits: number
}

export class BackgroundNewsPreloader {
  private config: IPreloaderConfig
  private stats: IPreloaderStats
  private preloaderTimer: number | null = null
  private activeRequests = new Map<string, Promise<void>>()
  private requestHistory: { timestamp: number; sourceId: string }[] = []

  constructor(config: Partial<IPreloaderConfig> = {}) {
    this.config = {
      enabled: config.enabled ?? true,
      interval: config.interval ?? 2 * 60 * 60 * 1000, // 2 hours default
      maxConcurrentRequests: config.maxConcurrentRequests ?? 3,
      retryAttempts: config.retryAttempts ?? 3,
      retryDelay: config.retryDelay ?? 5000, // 5 seconds
      rateLimitBuffer: config.rateLimitBuffer ?? 0.9, // 90% of limit
    }

    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      lastPreloadTime: null,
      nextPreloadTime: null,
      averageResponseTime: 0,
      rateLimitHits: 0,
    }

    this.loadStats()
    this.startPreloader()
  }

  // Load persisted stats
  private async loadStats(): Promise<void> {
    try {
      const savedStats = await storage.get<IPreloaderStats>('preloader.stats')
      if (savedStats) {
        Object.assign(this.stats, savedStats)
      }
    } catch (error) {
      console.warn('Failed to load preloader stats:', error)
    }
  }

  // Save stats to persistent storage
  private async saveStats(): Promise<void> {
    try {
      await storage.set('preloader.stats', this.stats)
    } catch (error) {
      console.warn('Failed to save preloader stats:', error)
    }
  }

  // Check if we can make a request to a source
  private canMakeRequest(source: IFeedSource): boolean {
    if (!source.rateLimit) return true

    const now = Date.now()
    const windowStart = now - source.rateLimit.window

    // Count requests in the current window
    const requestCount = this.requestHistory.filter(
      (req) => req.sourceId === source.id && req.timestamp > windowStart
    ).length

    const maxRequests = Math.floor(source.rateLimit.requests * this.config.rateLimitBuffer)

    if (requestCount >= maxRequests) {
      this.stats.rateLimitHits++
      return false
    }

    return true
  }

  // Record a request
  private recordRequest(sourceId: string): void {
    this.requestHistory.push({
      timestamp: Date.now(),
      sourceId,
    })

    // Clean old request history
    const now = Date.now()
    this.requestHistory = this.requestHistory.filter(
      (req) => now - req.timestamp < 24 * 60 * 60 * 1000 // Keep last 24 hours
    )
  }

  // Fetch and cache news from a source
  private async preloadSource(source: IFeedSource): Promise<void> {
    if (!source.enabled || this.activeRequests.has(source.id)) {
      return
    }

    if (!this.canMakeRequest(source)) {
      console.log(`Rate limit reached for source: ${source.name}`)
      return
    }

    const requestPromise = this.fetchWithRetry(source)
    this.activeRequests.set(source.id, requestPromise)

    try {
      await requestPromise
    } finally {
      this.activeRequests.delete(source.id)
    }
  }

  // Fetch with retry logic
  private async fetchWithRetry(source: IFeedSource, attempt = 1): Promise<void> {
    const startTime = Date.now()

    try {
      this.recordRequest(source.id)
      this.stats.totalRequests++

      // Check cache first
      const cacheKey = `news:${source.id}`
      const cached = cacheManager.get<INewsItem[]>(cacheKey)

      if (cached) {
        console.log(`Using cached news for: ${source.name}`)
        return
      }

      // Fetch fresh data
      const response = await fetch(source.url, {
        headers: {
          'User-Agent': 'ShakingHeadNews/1.0',
          Accept: 'application/json, application/rss+xml, text/xml',
        },
        signal: AbortSignal.timeout(30000), // 30 second timeout
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.text()
      const newsItems = await this.parseNewsData(data, source.type)

      // Cache the results
      cacheManager.set(cacheKey, newsItems, this.config.interval * 0.8) // Cache for 80% of interval

      // Update stats
      this.stats.successfulRequests++
      this.stats.lastPreloadTime = Date.now()
      this.stats.averageResponseTime =
        (this.stats.averageResponseTime * (this.stats.successfulRequests - 1) + (Date.now() - startTime)) /
        this.stats.successfulRequests

      console.log(`Successfully preloaded ${newsItems.length} items from: ${source.name}`)
    } catch (error) {
      this.stats.failedRequests++
      console.error(`Failed to preload from ${source.name} (attempt ${attempt}):`, error)

      if (attempt < this.config.retryAttempts) {
        // Exponential backoff
        const delay = this.config.retryDelay * Math.pow(2, attempt - 1)
        console.log(`Retrying in ${delay}ms...`)

        await new Promise((resolve) => setTimeout(resolve, delay))
        return this.fetchWithRetry(source, attempt + 1)
      }

      throw error
    }
  }

  // Parse news data based on type
  private async parseNewsData(data: string, type: string): Promise<INewsItem[]> {
    switch (type) {
      case 'json':
        return this.parseJsonFeed(data)
      case 'rss':
        return this.parseRssFeed(data)
      case 'api':
        return this.parseApiResponse(data)
      default:
        throw new Error(`Unsupported feed type: ${type}`)
    }
  }

  // Parse JSON feed
  private parseJsonFeed(data: string): INewsItem[] {
    try {
      const json = JSON.parse(data)

      // Handle different JSON formats
      if (Array.isArray(json)) {
        return json.map(this.normalizeNewsItem)
      } else if (json.items && Array.isArray(json.items)) {
        return json.items.map(this.normalizeNewsItem)
      } else if (json.articles && Array.isArray(json.articles)) {
        return json.articles.map(this.normalizeNewsItem)
      } else if (json.data && Array.isArray(json.data)) {
        return json.data.map(this.normalizeNewsItem)
      }

      throw new Error('Unknown JSON feed format')
    } catch (error) {
      console.error('Failed to parse JSON feed:', error)
      return []
    }
  }

  // Parse RSS feed
  private async parseRssFeed(data: string): Promise<INewsItem[]> {
    try {
      // For RSS feeds, we might need to use a DOMParser
      // Since we're in a browser extension context, we can use the DOM
      const parser = new DOMParser()
      const doc = parser.parseFromString(data, 'text/xml')

      const items = doc.querySelectorAll('item')
      const newsItems: INewsItem[] = []

      items.forEach((item) => {
        const title = item.querySelector('title')?.textContent || ''
        const link = item.querySelector('link')?.textContent || ''
        const description = item.querySelector('description')?.textContent || ''
        const pubDate = item.querySelector('pubDate')?.textContent || ''
        const guid = item.querySelector('guid')?.textContent || link

        if (title && link) {
          newsItems.push({
            id: guid,
            title,
            url: link,
            description,
            publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
            source: 'RSS Feed',
          })
        }
      })

      return newsItems
    } catch (error) {
      console.error('Failed to parse RSS feed:', error)
      return []
    }
  }

  // Parse API response
  private parseApiResponse(data: string): INewsItem[] {
    try {
      const json = JSON.parse(data)

      // Handle NewsAPI format
      if (json.status === 'ok' && json.articles) {
        return json.articles.map((article: unknown) => {
          const art = article as Record<string, unknown>
          return {
            id: String(art.url),
            title: String(art.title || ''),
            description: String(art.description || ''),
            content: String(art.content || ''),
            url: String(art.url),
            publishedAt: String(art.publishedAt),
            source: String((art.source as Record<string, unknown>)?.name || 'News API'),
            author: String(art.author || ''),
            imageUrl: String(art.urlToImage || ''),
          }
        })
      }

      return this.parseJsonFeed(data)
    } catch (error) {
      console.error('Failed to parse API response:', error)
      return []
    }
  }

  // Normalize news item to standard format
  private normalizeNewsItem(item: unknown): INewsItem {
    const data = item as Record<string, unknown>
    return {
      id: String(data.id || data.url || data.guid || Math.random()),
      title: String(data.title || data.headline || ''),
      description: String(data.description || data.summary || data.excerpt || ''),
      content: String(data.content || data.body || ''),
      url: String(data.url || data.link || data.href || ''),
      publishedAt: String(data.publishedAt || data.pubDate || data.date || new Date().toISOString()),
      source: String(data.source || data.site || ''),
      category: String(data.category || data.section || ''),
      author: String(data.author || data.creator || ''),
      imageUrl: String(data.imageUrl || data.image || data.thumbnail || ''),
    }
  }

  // Start the preloader
  private startPreloader(): void {
    if (!this.config.enabled || typeof window === 'undefined') return

    // Initial preload
    this.preloadAll()

    // Set up periodic preloading
    this.preloaderTimer = window.setInterval(() => {
      this.preloadAll()
    }, this.config.interval)

    this.stats.nextPreloadTime = Date.now() + this.config.interval
  }

  // Preload all enabled sources
  private async preloadAll(): Promise<void> {
    try {
      const sources = (await storage.get<IFeedSource[]>('feed.sources')) || []

      // Limit concurrent requests
      const enabledSources = sources.filter((s) => s.enabled)
      const batches = []

      for (let i = 0; i < enabledSources.length; i += this.config.maxConcurrentRequests) {
        batches.push(enabledSources.slice(i, i + this.config.maxConcurrentRequests))
      }

      for (const batch of batches) {
        await Promise.all(batch.map((source) => this.preloadSource(source)))
        await new Promise((resolve) => setTimeout(resolve, 1000)) // 1 second between batches
      }

      this.saveStats()
    } catch (error) {
      console.error('Error during preloading:', error)
    }
  }

  // Manual preload trigger
  async preloadNow(sourceIds?: string[]): Promise<void> {
    try {
      const sources = (await storage.get<IFeedSource[]>('feed.sources')) || []
      const targetSources = sourceIds
        ? sources.filter((s) => sourceIds.includes(s.id))
        : sources.filter((s) => s.enabled)

      await Promise.all(targetSources.map((source) => this.preloadSource(source)))
      this.saveStats()
    } catch (error) {
      console.error('Error during manual preload:', error)
      throw error
    }
  }

  // Get cached news
  async getCachedNews(sourceId: string): Promise<INewsItem[] | null> {
    const cacheKey = `news:${sourceId}`
    return cacheManager.get<INewsItem[]>(cacheKey)
  }

  // Get preloader stats
  getStats(): IPreloaderStats {
    return { ...this.stats }
  }

  // Get configuration
  getConfig(): IPreloaderConfig {
    return { ...this.config }
  }

  // Update configuration
  updateConfig(newConfig: Partial<IPreloaderConfig>): void {
    this.config = { ...this.config, ...newConfig }

    // Restart preloader if interval changed
    if (this.preloaderTimer) {
      clearInterval(this.preloaderTimer)
      this.preloaderTimer = null
    }

    if (this.config.enabled) {
      this.startPreloader()
    }
  }

  // Stop the preloader
  stop(): void {
    if (this.preloaderTimer) {
      clearInterval(this.preloaderTimer)
      this.preloaderTimer = null
    }
  }

  // Destroy preloader
  destroy(): void {
    this.stop()
    this.activeRequests.clear()
    this.requestHistory = []
  }
}

// Create global preloader instance
export const newsPreloader = new BackgroundNewsPreloader()

// Export for testing
// export { BackgroundNewsPreloader } // Already exported above
