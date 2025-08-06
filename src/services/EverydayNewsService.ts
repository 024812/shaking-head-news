import { ApiService } from './ApiService'
import type { IEverydayNews } from '../types'

export class EverydayNewsService extends ApiService {
  constructor(baseUrl?: string) {
    super(baseUrl || 'https://ravelloh.github.io/EverydayNews')
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
    const today = new Date()

    // Try to get today's news first
    let news = await this.getNewsForDate(today)

    // If today's news is not available, get the latest news
    if (!news) {
      news = await this.getLatestNews()
    }

    return news
  }

  /**
   * Format date string from API format (YYYY/MM/DD) to display format
   */
  formatDateString(dateString: string): string {
    try {
      const [year, month, day] = dateString.split('/')
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
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
