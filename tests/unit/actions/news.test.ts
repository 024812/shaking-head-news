import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getNews, refreshNews, getRSSNews, refreshRSSFeed } from '@/lib/actions/news'
import { mockNewsItems } from '@/tests/utils/test-utils'

// Mock dependencies
vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
}))

vi.mock('@/lib/utils/error-handler', () => ({
  logError: vi.fn(),
  validateOrThrow: vi.fn((schema, data) => data),
  AuthError: class AuthError extends Error {},
  ValidationError: class ValidationError extends Error {},
  NotFoundError: class NotFoundError extends Error {},
}))

import { revalidateTag } from 'next/cache'

// Mock global fetch
const mockFetch = vi.fn()
global.fetch = mockFetch as any

describe('News Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEWS_API_BASE_URL = 'https://news.ravelloh.top'
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('getNews', () => {
    it('should fetch news successfully with default language', async () => {
      const mockResponse = {
        items: mockNewsItems,
        total: mockNewsItems.length,
        updatedAt: new Date().toISOString(),
      }

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await getNews('zh')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('latest.json?lang=zh'),
        expect.objectContaining({
          next: expect.objectContaining({
            revalidate: 3600,
            tags: expect.arrayContaining(['news', 'news-zh', 'news-latest']),
          }),
        })
      )
      expect(result.items).toHaveLength(mockNewsItems.length)
    })

    it('should fetch news from specific source', async () => {
      const mockResponse = {
        items: mockNewsItems,
        total: mockNewsItems.length,
        updatedAt: new Date().toISOString(),
      }

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      })

      await getNews('en', 'everydaynews')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('everydaynews.json?lang=en'),
        expect.objectContaining({
          next: expect.objectContaining({
            tags: expect.arrayContaining(['news', 'news-en', 'news-everydaynews']),
          }),
        })
      )
    })

    it('should retry on fetch failure', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            items: mockNewsItems,
            total: mockNewsItems.length,
            updatedAt: new Date().toISOString(),
          }),
        })

      const result = await getNews('zh')

      expect(mockFetch).toHaveBeenCalledTimes(3)
      expect(result.items).toHaveLength(mockNewsItems.length)
    })

    it('should throw error after max retries', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      await expect(getNews('zh')).rejects.toThrow()
      expect(mockFetch).toHaveBeenCalledTimes(4) // Initial + 3 retries
    })

    it('should throw error on non-ok response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      })

      await expect(getNews('zh')).rejects.toThrow()
    })
  })

  describe('refreshNews', () => {
    it('should refresh all news when no parameters provided', async () => {
      const result = await refreshNews()

      expect(revalidateTag).toHaveBeenCalledWith('news')
      expect(result.success).toBe(true)
    })

    it('should refresh specific language news', async () => {
      await refreshNews('zh')

      expect(revalidateTag).toHaveBeenCalledWith('news-zh')
    })

    it('should refresh specific source news', async () => {
      await refreshNews(undefined, 'everydaynews')

      expect(revalidateTag).toHaveBeenCalledWith('news-everydaynews')
    })

    it('should handle errors gracefully', async () => {
      vi.mocked(revalidateTag).mockImplementation(() => {
        throw new Error('Revalidation error')
      })

      await expect(refreshNews()).rejects.toThrow()
    })
  })

  describe('getRSSNews', () => {
    const mockRSSXML = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Test RSS Feed</title>
    <item>
      <title>Test News 1</title>
      <link>https://example.com/news/1</link>
      <description>Test description 1</description>
      <pubDate>Mon, 01 Jan 2024 00:00:00 GMT</pubDate>
      <guid>https://example.com/news/1</guid>
    </item>
    <item>
      <title>Test News 2</title>
      <link>https://example.com/news/2</link>
      <description><![CDATA[<p>Test description 2</p>]]></description>
      <pubDate>Tue, 02 Jan 2024 00:00:00 GMT</pubDate>
      <guid>https://example.com/news/2</guid>
    </item>
  </channel>
</rss>`

    it('should parse RSS feed successfully', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: async () => mockRSSXML,
      })

      const result = await getRSSNews('https://example.com/rss.xml')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/rss.xml',
        expect.objectContaining({
          next: expect.objectContaining({
            revalidate: 1800,
            tags: expect.arrayContaining(['rss', 'rss-https://example.com/rss.xml']),
          }),
        })
      )
      expect(result).toHaveLength(2)
      expect(result[0].title).toBe('Test News 1')
      expect(result[1].title).toBe('Test News 2')
    })

    it('should retry on fetch failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error')).mockResolvedValueOnce({
        ok: true,
        text: async () => mockRSSXML,
      })

      const result = await getRSSNews('https://example.com/rss.xml')

      expect(mockFetch).toHaveBeenCalledTimes(2)
      expect(result).toHaveLength(2)
    })

    it('should throw error on non-ok response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      })

      await expect(getRSSNews('https://example.com/rss.xml')).rejects.toThrow()
    })

    it('should throw error when no valid items found', async () => {
      const emptyRSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Empty Feed</title>
  </channel>
</rss>`

      mockFetch.mockResolvedValue({
        ok: true,
        text: async () => emptyRSS,
      })

      await expect(getRSSNews('https://example.com/rss.xml')).rejects.toThrow()
    })

    it('should clean HTML from descriptions', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: async () => mockRSSXML,
      })

      const result = await getRSSNews('https://example.com/rss.xml')

      expect(result[1].description).not.toContain('<p>')
      expect(result[1].description).toBe('Test description 2')
    })

    it('should parse V2EX Atom feed successfully', async () => {
      const v2exXML = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en" xml:base="https://www.v2ex.com/">
  <title type="text">V2EX</title>
  <entry>
    <title>Test V2EX Topic</title>
    <link href="https://www.v2ex.com/t/123456" rel="alternate" type="text/html" />
    <content type="html">
      &lt;p&gt;Test content&lt;/p&gt;
    </content>
    <updated>2025-11-19T04:17:38Z</updated>
    <id>tag:v2ex.com,2025:topic:123456</id>
    <author>
      <name>testuser</name>
    </author>
  </entry>
</feed>`

      mockFetch.mockResolvedValue({
        ok: true,
        text: async () => v2exXML,
      })

      const result = await getRSSNews('https://v2ex.com/index.xml')

      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Test V2EX Topic')
      expect(result[0].url).toBe('https://www.v2ex.com/t/123456')
      expect(result[0].description).toBe('Test content')
    })
  })

  describe('refreshRSSFeed', () => {
    it('should refresh specific RSS feed', async () => {
      const result = await refreshRSSFeed('https://example.com/rss.xml')

      expect(revalidateTag).toHaveBeenCalledWith('rss-https://example.com/rss.xml')
      expect(result.success).toBe(true)
    })

    it('should handle errors gracefully', async () => {
      vi.mocked(revalidateTag).mockImplementation(() => {
        throw new Error('Revalidation error')
      })

      await expect(refreshRSSFeed('https://example.com/rss.xml')).rejects.toThrow()
    })
  })
})
