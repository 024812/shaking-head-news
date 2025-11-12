import { ApiService } from './ApiService'
import type { IEverydayNews } from '../types'
export class EverydayNewsService extends ApiService {
  constructor(baseUrl?: string) {
    super(baseUrl || 'https://news.ravelloh.top/rss.xml')
  }

  /**
   * Get news from an RSS feed using native browser APIs
   */
  async getNewsFromRss(url: string): Promise<IEverydayNews | null> {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
    try {
      const response = await fetch(proxyUrl)
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)

      const data = await response.json()
      const text = data.contents
      if (!text) throw new Error('No content received from proxy.')

      const parser = new DOMParser()
      const doc = parser.parseFromString(text, 'application/xml')

      const errorNode = doc.querySelector('parsererror')
      if (errorNode) {
        console.error('Error parsing XML:', errorNode.textContent)
        return null
      }

      const descriptionNode = doc.querySelector('item > description, entry > content')
      let content: string[] = []

      if (descriptionNode?.textContent) {
        // The content is a single string with <br> tags.
        // Split by <br> and clean up the resulting strings.
        content = descriptionNode.textContent
          .split(/<br\s*\/?>/g)
          .map((line) => line.trim())
          .filter((line) => line) // Remove empty lines
          .slice(0, 16) // Take the first 16 items
      }

      const lastBuildDate = doc.querySelector('lastBuildDate, updated')?.textContent
      const feedDate = lastBuildDate ? new Date(lastBuildDate) : new Date()

      return {
        date: feedDate.toLocaleDateString('en-CA'),
        content,
      }
    } catch (error) {
      this.handleError(error)
      return null
    }
  }

  /**
   * Get the latest news
   */
  async getLatestNews(): Promise<IEverydayNews | null> {
    try {
      const response = await fetch(`${this.getUrl()}/latest.json`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      this.handleError(error)
      return null
    }
  }

  /**
   * Get news for a specific date
   */
  async getNewsForDate(date: Date): Promise<IEverydayNews | null> {
    try {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')

      const response = await fetch(`${this.getUrl()}/data/${year}/${month}/${day}.json`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      this.handleError(error)
      return null
    }
  }

  /**
   * Get news for today or fallback to latest available
   */
  async getTodayNewsWithFallback(): Promise<IEverydayNews | null> {
    const url = this.getUrl()

    // Try RSS first, as it's now the default and a common custom format
    const rssNews = await this.getNewsFromRss(url)
    if (rssNews) {
      return rssNews
    }

    // If RSS fails, try to fetch as a JSON API
    try {
      const response = await fetch(url)
      if (!response.ok) {
        // If the fetch itself fails for a known JSON source, try the old fallback
        if (url.includes('EverydayNews')) {
          return this.getLatestNews()
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const jsonNews: IEverydayNews = await response.json()
      // Basic validation for the JSON structure
      if (jsonNews && jsonNews.content && Array.isArray(jsonNews.content)) {
        return jsonNews
      }
      return null
    } catch (error) {
      this.handleError(error)
      // Final fallback for the original default source if all else fails
      if (url.includes('EverydayNews')) {
        return this.getLatestNews()
      }
      return null
    }
  }

  /**
   * Format date string from API format (YYYY/MM/DD) to display format
   */
  formatDateString(dateString: string): string {
    try {
      // Normalize date string to use slashes, making parsing more robust
      const normalizedDateString = dateString.replace(/-/g, '/')
      const [year, month, day] = normalizedDateString.split('/')
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))

      // Check if the date is valid
      if (isNaN(date.getTime())) {
        // Return original string or a fallback if date is invalid
        return dateString
      }

      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch (error) {
      this.handleError(error)
      return dateString
    }
  }
}
