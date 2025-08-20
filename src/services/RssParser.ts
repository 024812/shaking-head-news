// Advanced RSS Parser with multiple format support and error handling
import { type INewsItem } from './NewsPreloader'

export interface IRssFeed {
  title: string
  description: string
  link: string
  language?: string
  lastBuildDate?: string
  items: INewsItem[]
}

export interface IParserConfig {
  maxItems: number
  minContentLength: number
  stripHtml: boolean
  sanitizeContent: boolean
  extractImages: boolean
  timeout: number
}

export interface IParserStats {
  totalParsed: number
  successfulParses: number
  failedParses: number
  averageParseTime: number
  formatDistribution: Record<string, number>
}

export class AdvancedRssParser {
  private config: IParserConfig
  private stats: IParserStats
  private corsProxyUrl: string

  constructor(config: Partial<IParserConfig> = {}) {
    this.config = {
      maxItems: config.maxItems || 50,
      minContentLength: config.minContentLength || 10,
      stripHtml: config.stripHtml ?? true,
      sanitizeContent: config.sanitizeContent ?? true,
      extractImages: config.extractImages ?? true,
      timeout: config.timeout || 30000,
    }

    this.stats = {
      totalParsed: 0,
      successfulParses: 0,
      failedParses: 0,
      averageParseTime: 0,
      formatDistribution: {},
    }

    // CORS proxy for RSS feeds
    this.corsProxyUrl = 'https://api.rss2json.com/v1/api.json?rss_url='
  }

  // Parse feed from URL
  async parseFromUrl(url: string, useProxy = true): Promise<IRssFeed> {
    const startTime = Date.now()
    this.stats.totalParsed++

    try {
      let response: Response
      let format: string

      if (useProxy && this.isRssUrl(url)) {
        // Use CORS proxy for RSS feeds
        const proxyUrl = this.corsProxyUrl + encodeURIComponent(url)
        response = await fetch(proxyUrl, {
          signal: AbortSignal.timeout(this.config.timeout),
        })
        format = 'rss-proxy'
      } else {
        // Direct fetch
        response = await fetch(url, {
          headers: {
            'User-Agent': 'ShakingHeadNews/1.0',
            Accept: 'application/json, application/rss+xml, text/xml, application/atom+xml',
          },
          signal: AbortSignal.timeout(this.config.timeout),
        })

        // Detect format from content type
        const contentType = response.headers.get('content-type') || ''
        format = this.detectFormat(contentType, url)
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.text()
      const feed = await this.parseFeed(data, format, url)

      // Update stats
      this.stats.successfulParses++
      const parseTime = Date.now() - startTime
      this.stats.averageParseTime =
        (this.stats.averageParseTime * (this.stats.successfulParses - 1) + parseTime) / this.stats.successfulParses

      this.stats.formatDistribution[format] = (this.stats.formatDistribution[format] || 0) + 1

      return feed
    } catch (error) {
      this.stats.failedParses++
      console.error(`Failed to parse feed from ${url}:`, error)

      // Return fallback feed
      return this.createFallbackFeed(url, error instanceof Error ? error.message : String(error))
    }
  }

  // Parse feed from data string
  async parseFeed(data: string, format: string, sourceUrl?: string): Promise<IRssFeed> {
    switch (format) {
      case 'rss':
      case 'rss-proxy':
        return this.parseRss(data, sourceUrl)
      case 'atom':
        return this.parseAtom(data, sourceUrl)
      case 'json':
      case 'json-feed':
        return this.parseJsonFeed(data, sourceUrl)
      default:
        // Try to auto-detect format
        if (data.trim().startsWith('{')) {
          return this.parseJsonFeed(data, sourceUrl)
        } else if (data.includes('<rss') || data.includes('<channel')) {
          return this.parseRss(data, sourceUrl)
        } else if (data.includes('<feed') && data.includes('xmlns="http://www.w3.org/2005/Atom"')) {
          return this.parseAtom(data, sourceUrl)
        } else {
          throw new Error(`Unsupported feed format: ${format}`)
        }
    }
  }

  // Parse RSS feed
  private parseRss(data: string, sourceUrl?: string): IRssFeed {
    try {
      // Handle RSS proxy format
      if (data.trim().startsWith('{')) {
        const json = JSON.parse(data)
        if (json.status === 'ok' && json.items) {
          return {
            title: json.feed?.title || 'RSS Feed',
            description: json.feed?.description || '',
            link: json.feed?.link || sourceUrl || '',
            items: json.items.slice(0, this.config.maxItems).map(this.normalizeRssItem),
          }
        }
      }

      // Parse XML RSS
      const parser = new DOMParser()
      const doc = parser.parseFromString(data, 'text/xml')

      // Check for parsing errors
      const errorNode = doc.querySelector('parsererror')
      if (errorNode) {
        throw new Error('Invalid RSS XML')
      }

      const channel = doc.querySelector('channel')
      if (!channel) {
        throw new Error('No channel found in RSS feed')
      }

      const feed: IRssFeed = {
        title: this.getTextContent(channel, 'title') || 'RSS Feed',
        description: this.getTextContent(channel, 'description') || '',
        link: this.getTextContent(channel, 'link') || sourceUrl || '',
        language: this.getTextContent(channel, 'language'),
        lastBuildDate: this.getTextContent(channel, 'lastBuildDate'),
        items: [],
      }

      const items = channel.querySelectorAll('item')
      items.forEach((item) => {
        if (feed.items.length >= this.config.maxItems) return

        const newsItem = this.parseRssItem(item)
        if (newsItem && this.isValidItem(newsItem)) {
          feed.items.push(newsItem)
        }
      })

      return feed
    } catch (error) {
      console.error('RSS parsing error:', error)
      throw error
    }
  }

  // Parse Atom feed
  private parseAtom(data: string, sourceUrl?: string): IRssFeed {
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(data, 'text/xml')

      const feedNode = doc.querySelector('feed')
      if (!feedNode) {
        throw new Error('No feed found in Atom feed')
      }

      const feed: IRssFeed = {
        title: this.getTextContent(feedNode, 'title') || 'Atom Feed',
        description: this.getTextContent(feedNode, 'subtitle') || '',
        link: sourceUrl || '',
        language: feedNode.getAttribute('xml:lang') || undefined,
        items: [],
      }

      const entries = feedNode.querySelectorAll('entry')
      entries.forEach((entry) => {
        if (feed.items.length >= this.config.maxItems) return

        const newsItem = this.parseAtomItem(entry)
        if (newsItem && this.isValidItem(newsItem)) {
          feed.items.push(newsItem)
        }
      })

      return feed
    } catch (error) {
      console.error('Atom parsing error:', error)
      throw error
    }
  }

  // Parse JSON feed
  private parseJsonFeed(data: string, sourceUrl?: string): IRssFeed {
    try {
      const json = JSON.parse(data)

      // Handle JSON Feed format (https://jsonfeed.org/)
      if (json.version && json.items) {
        return {
          title: json.title || 'JSON Feed',
          description: json.description || '',
          link: json.home_page_url || sourceUrl || '',
          items: json.items.slice(0, this.config.maxItems).map(this.normalizeJsonFeedItem),
        }
      }

      // Handle generic JSON format
      if (Array.isArray(json)) {
        return {
          title: 'JSON Feed',
          description: '',
          link: sourceUrl || '',
          items: json.slice(0, this.config.maxItems).map(this.normalizeJsonItem),
        }
      }

      // Handle NewsAPI format
      if (json.status === 'ok' && json.articles) {
        return {
          title: 'News API Feed',
          description: '',
          link: sourceUrl || '',
          items: json.articles.slice(0, this.config.maxItems).map(this.normalizeNewsApiItem),
        }
      }

      // Handle custom format with items array
      if (json.items && Array.isArray(json.items)) {
        return {
          title: json.title || 'JSON Feed',
          description: json.description || '',
          link: json.link || sourceUrl || '',
          items: json.items.slice(0, this.config.maxItems).map(this.normalizeJsonItem),
        }
      }

      throw new Error('Unknown JSON feed format')
    } catch (error) {
      console.error('JSON parsing error:', error)
      throw error
    }
  }

  // Parse RSS item
  private parseRssItem(item: Element): INewsItem | null {
    try {
      const title = this.getTextContent(item, 'title')
      const link = this.getTextContent(item, 'link')
      const guid = this.getTextContent(item, 'guid') || link
      const description = this.getTextContent(item, 'description') || this.getTextContent(item, 'content:encoded')
      const pubDate = this.getTextContent(item, 'pubDate')
      const creator = this.getTextContent(item, 'dc:creator') || this.getTextContent(item, 'author')

      if (!title || !link) return null

      let content = description
      if (this.config.stripHtml) {
        content = this.stripHtmlTags(content)
      }

      return {
        id: guid,
        title: this.stripHtmlTags(title),
        description: content,
        url: link,
        publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        source: 'RSS',
        author: creator,
        imageUrl: this.config.extractImages ? this.extractImageUrl(description) : undefined,
      }
    } catch (error) {
      console.error('Error parsing RSS item:', error)
      return null
    }
  }

  // Parse Atom entry
  private parseAtomItem(entry: Element): INewsItem | null {
    try {
      const title = this.getTextContent(entry, 'title')
      const link = entry.querySelector('link')?.getAttribute('href') || ''
      const id = this.getTextContent(entry, 'id') || link
      const content = this.getTextContent(entry, 'content') || this.getTextContent(entry, 'summary')
      const published = this.getTextContent(entry, 'published')
      const updated = this.getTextContent(entry, 'updated')
      const author = entry.querySelector('author name')?.textContent || ''

      if (!title || !link) return null

      let finalContent = content
      if (this.config.stripHtml) {
        finalContent = this.stripHtmlTags(content)
      }

      return {
        id,
        title: this.stripHtmlTags(title),
        description: finalContent,
        url: link,
        publishedAt: published
          ? new Date(published).toISOString()
          : updated
            ? new Date(updated).toISOString()
            : new Date().toISOString(),
        source: 'Atom',
        author,
        imageUrl: this.config.extractImages ? this.extractImageUrl(content) : undefined,
      }
    } catch (error) {
      console.error('Error parsing Atom item:', error)
      return null
    }
  }

  // Normalize RSS proxy item
  private normalizeRssItem(item: unknown): INewsItem {
    return {
      id: item.guid || item.link,
      title: item.title,
      description: item.description,
      content: item.content,
      url: item.link,
      publishedAt: item.pubDate,
      source: 'RSS',
      author: item.author,
      imageUrl: this.config.extractImages ? this.extractImageUrl(item.content || item.description) : undefined,
    }
  }

  // Normalize JSON Feed item
  private normalizeJsonFeedItem(item: unknown): INewsItem {
    return {
      id: item.id || item.url,
      title: item.title,
      description: item.summary || item.content_text,
      content: item.content_html || item.content_text,
      url: item.url,
      publishedAt: item.date_published || item.published,
      source: 'JSON Feed',
      author: item.author?.name,
      imageUrl: item.image || item.banner_image,
    }
  }

  // Normalize generic JSON item
  private normalizeJsonItem(item: unknown): INewsItem {
    return {
      id: item.id || item.url || String(Math.random()),
      title: item.title || item.headline || '',
      description: item.description || item.summary || item.excerpt || '',
      content: item.content || item.body || '',
      url: item.url || item.link || '',
      publishedAt: item.publishedAt || item.date || item.created_at || new Date().toISOString(),
      source: 'JSON',
      author: item.author || item.creator || '',
      imageUrl: item.image || item.thumbnail || item.featured_image,
    }
  }

  // Normalize NewsAPI item
  private normalizeNewsApiItem(item: unknown): INewsItem {
    return {
      id: item.url,
      title: item.title,
      description: item.description,
      content: item.content,
      url: item.url,
      publishedAt: item.publishedAt,
      source: item.source?.name || 'News API',
      author: item.author,
      imageUrl: item.urlToImage,
    }
  }

  // Helper methods
  private getTextContent(element: Element, selector: string): string {
    const node = element.querySelector(selector)
    return node?.textContent?.trim() || ''
  }

  private detectFormat(contentType: string, url: string): string {
    const type = contentType.toLowerCase()

    if (type.includes('rss') || type.includes('rdf')) return 'rss'
    if (type.includes('atom')) return 'atom'
    if (type.includes('json')) return 'json'
    if (url.includes('.rss') || url.includes('.xml')) return 'rss'
    if (url.includes('.atom')) return 'atom'
    if (url.includes('.json')) return 'json'

    return 'rss' // Default assumption
  }

  private isRssUrl(url: string): boolean {
    return (
      url.includes('.rss') ||
      url.includes('.xml') ||
      url.includes('feed=') ||
      url.includes('/rss/') ||
      url.includes('/feed/')
    )
  }

  private isValidItem(item: INewsItem): boolean {
    return item.title.length >= this.config.minContentLength && item.url.length > 0 && item.title.length < 500 // Prevent spam titles
  }

  private stripHtmlTags(html: string): string {
    if (!html) return ''

    // Simple HTML tag removal
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  private extractImageUrl(html: string): string | undefined {
    if (!html) return undefined

    // Extract first image URL from HTML
    const imgMatch = html.match(/<img[^>]+src="([^"]+)"/)
    return imgMatch ? imgMatch[1] : undefined
  }

  private createFallbackFeed(url: string, error: string): IRssFeed {
    return {
      title: 'Feed Unavailable',
      description: `Unable to load feed from ${url}. Error: ${error}`,
      link: url || '',
      items: [
        {
          id: 'error',
          title: 'Feed Loading Error',
          description: `The feed could not be loaded. Please check the URL and try again.`,
          url: url || '',
          publishedAt: new Date().toISOString(),
          source: 'Error',
        },
      ],
    }
  }

  // Public methods
  getStats(): IParserStats {
    return { ...this.stats }
  }

  getConfig(): IParserConfig {
    return { ...this.config }
  }

  updateConfig(newConfig: Partial<IParserConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  resetStats(): void {
    this.stats = {
      totalParsed: 0,
      successfulParses: 0,
      failedParses: 0,
      averageParseTime: 0,
      formatDistribution: {},
    }
  }
}

// Create global parser instance
export const rssParser = new AdvancedRssParser()

// Export for testing
// export { AdvancedRssParser } // Already exported above
