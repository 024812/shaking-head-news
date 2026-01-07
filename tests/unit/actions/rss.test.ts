import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getRSSSources,
  addRSSSource,
  updateRSSSource,
  deleteRSSSource,
  reorderRSSSources,
  exportOPML,
} from '@/lib/actions/rss'
import { mockRSSSources } from '@/tests/utils/test-utils'

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/storage', () => ({
  getStorageItem: vi.fn(),
  setStorageItem: vi.fn(),
  StorageKeys: {
    userRSSSources: (userId: string) => `user:${userId}:rss-sources`,
  },
}))

vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/rate-limit', () => ({
  rateLimitByUser: vi.fn().mockResolvedValue({ success: true }),
  rateLimitByAction: vi.fn().mockResolvedValue({ success: true }),
  RateLimitTiers: {
    STANDARD: { limit: 30, window: 60 },
    STRICT: { limit: 5, window: 900 },
  },
}))

vi.mock('@/lib/utils/error-handler', () => ({
  logError: vi.fn(),
  validateOrThrow: vi.fn((schema, data) => data),
  AuthError: class AuthError extends Error {},
  NotFoundError: class NotFoundError extends Error {},
  ValidationError: class ValidationError extends Error {},
}))

vi.mock('@/lib/utils/input-validation', () => ({
  sanitizeUrl: vi.fn((url) => url),
  sanitizeString: vi.fn((str) => str),
  sanitizeObject: vi.fn((obj) => obj),
}))

import { auth } from '@/lib/auth'
import { getStorageItem, setStorageItem } from '@/lib/storage'
import { revalidateTag, revalidatePath } from 'next/cache'
import { rateLimitByUser, rateLimitByAction } from '@/lib/rate-limit'

// Mock global fetch
const mockFetch = vi.fn()
global.fetch = mockFetch as any

// Mock crypto.randomUUID using vi.stubGlobal
vi.stubGlobal('crypto', {
  ...globalThis.crypto,
  randomUUID: vi.fn(() => 'test-uuid'),
})

describe('RSS Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset rate limit mocks to default success state
    vi.mocked(rateLimitByUser).mockResolvedValue({ success: true, remaining: 10, reset: Date.now() + 60000 })
    vi.mocked(rateLimitByAction).mockResolvedValue({ success: true, remaining: 10, reset: Date.now() + 60000 })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('getRSSSources', () => {
    it('should return empty array for unauthenticated users', async () => {
      vi.mocked(auth).mockResolvedValue(null)

      const result = await getRSSSources()

      expect(result).toEqual([])
    })

    it('should return RSS sources for authenticated users', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })
      vi.mocked(getStorageItem).mockResolvedValue(mockRSSSources)

      const result = await getRSSSources()

      expect(result).toHaveLength(mockRSSSources.length)
      expect(getStorageItem).toHaveBeenCalledWith('user:test-user-id:rss-sources')
    })

    it('should return empty array when no sources exist', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })
      vi.mocked(getStorageItem).mockResolvedValue(null)

      const result = await getRSSSources()

      expect(result).toEqual([])
    })

    it('should handle storage errors gracefully', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })
      vi.mocked(getStorageItem).mockRejectedValue(new Error('Storage error'))

      const result = await getRSSSources()

      expect(result).toEqual([])
    })
  })

  describe('addRSSSource', () => {
    const newSource = {
      name: 'New RSS Feed',
      url: 'https://example.com/new-rss.xml',
      description: 'A new RSS feed',
      language: 'zh' as const,
      enabled: true,
      tags: ['tech'],
    }

    it('should throw error for unauthenticated users', async () => {
      vi.mocked(auth).mockResolvedValue(null)

      await expect(addRSSSource(newSource)).rejects.toThrow('sign in')
    })

    it('should add RSS source successfully', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })
      vi.mocked(getStorageItem).mockResolvedValue([])
      vi.mocked(setStorageItem).mockResolvedValue(undefined)
      mockFetch.mockResolvedValue({ ok: true })

      const result = await addRSSSource(newSource)

      expect(result.id).toBe('test-uuid')
      expect(result.name).toBe(newSource.name)
      expect(result.order).toBe(0)
      expect(result.failureCount).toBe(0)
      expect(setStorageItem).toHaveBeenCalled()
    })

    it('should respect rate limits', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })
      vi.mocked(rateLimitByAction).mockResolvedValue({ success: false })

      await expect(addRSSSource(newSource)).rejects.toThrow('Too many')
    })

    it('should validate RSS URL accessibility', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })
      vi.mocked(getStorageItem).mockResolvedValue([])
      mockFetch.mockResolvedValue({ ok: false })

      await expect(addRSSSource(newSource)).rejects.toThrow()
    })

    it('should limit maximum number of RSS sources', async () => {
      const maxSources = Array(50).fill(mockRSSSources[0])

      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })
      vi.mocked(getStorageItem).mockResolvedValue(maxSources)

      await expect(addRSSSource(newSource)).rejects.toThrow('Maximum number')
    })

    it('should set correct order for new source', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })
      vi.mocked(getStorageItem).mockResolvedValue(mockRSSSources)
      vi.mocked(setStorageItem).mockResolvedValue(undefined)
      mockFetch.mockResolvedValue({ ok: true })

      const result = await addRSSSource(newSource)

      expect(result.order).toBe(mockRSSSources.length)
    })

    it('should handle fetch timeout', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })
      vi.mocked(getStorageItem).mockResolvedValue([])
      mockFetch.mockRejectedValue(new Error('Timeout'))

      await expect(addRSSSource(newSource)).rejects.toThrow()
    })
  })

  describe('updateRSSSource', () => {
    it('should throw error for unauthenticated users', async () => {
      vi.mocked(auth).mockResolvedValue(null)

      await expect(updateRSSSource('1', { name: 'Updated' })).rejects.toThrow('sign in')
    })

    it('should update RSS source successfully', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })
      vi.mocked(getStorageItem).mockResolvedValue(mockRSSSources)
      vi.mocked(setStorageItem).mockResolvedValue(undefined)

      const result = await updateRSSSource('1', { name: 'Updated Name' })

      expect(result.name).toBe('Updated Name')
      expect(setStorageItem).toHaveBeenCalled()
      expect(revalidateTag).toHaveBeenCalled()
    })

    it('should throw error when source not found', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })
      vi.mocked(getStorageItem).mockResolvedValue(mockRSSSources)

      await expect(updateRSSSource('non-existent', { name: 'Updated' })).rejects.toThrow(
        'not found'
      )
    })

    it('should respect rate limits', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })
      vi.mocked(rateLimitByAction).mockResolvedValue({ success: false, remaining: 0, reset: Date.now() + 60000 })

      await expect(updateRSSSource('1', { name: 'Updated' })).rejects.toThrow('Too many requests')
    })

    it('should clear cache when updating source', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })
      vi.mocked(getStorageItem).mockResolvedValue(mockRSSSources)
      vi.mocked(setStorageItem).mockResolvedValue(undefined)

      await updateRSSSource('1', { enabled: false })

      expect(revalidateTag).toHaveBeenCalledWith(`rss-${mockRSSSources[0].url}`, { expire: 0 })
    })
  })

  describe('deleteRSSSource', () => {
    it('should throw error for unauthenticated users', async () => {
      vi.mocked(auth).mockResolvedValue(null)

      await expect(deleteRSSSource('1')).rejects.toThrow('sign in')
    })

    it('should delete RSS source successfully', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })
      vi.mocked(getStorageItem).mockResolvedValue(mockRSSSources)
      vi.mocked(setStorageItem).mockResolvedValue(undefined)

      await deleteRSSSource('1')

      expect(setStorageItem).toHaveBeenCalledWith(
        'user:test-user-id:rss-sources',
        expect.arrayContaining([expect.objectContaining({ id: '2' })])
      )
      expect(revalidateTag).toHaveBeenCalled()
    })

    it('should throw error when source not found', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })
      vi.mocked(getStorageItem).mockResolvedValue(mockRSSSources)

      await expect(deleteRSSSource('non-existent')).rejects.toThrow('not found')
    })
  })

  describe('reorderRSSSources', () => {
    it('should throw error for unauthenticated users', async () => {
      vi.mocked(auth).mockResolvedValue(null)

      await expect(reorderRSSSources(['1', '2'])).rejects.toThrow('sign in')
    })

    it('should reorder RSS sources successfully', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })
      vi.mocked(getStorageItem).mockResolvedValue(mockRSSSources)
      vi.mocked(setStorageItem).mockResolvedValue(undefined)

      const result = await reorderRSSSources(['2', '1'])

      expect(result[0].id).toBe('2')
      expect(result[0].order).toBe(0)
      expect(result[1].id).toBe('1')
      expect(result[1].order).toBe(1)
      expect(setStorageItem).toHaveBeenCalled()
    })

    it('should throw error when source not found', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })
      vi.mocked(getStorageItem).mockResolvedValue(mockRSSSources)

      await expect(reorderRSSSources(['1', 'non-existent'])).rejects.toThrow('not found')
    })
  })

  describe('exportOPML', () => {
    it('should throw error for unauthenticated users', async () => {
      vi.mocked(auth).mockResolvedValue(null)

      await expect(exportOPML()).rejects.toThrow('sign in')
    })

    it('should export OPML successfully', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })
      vi.mocked(getStorageItem).mockResolvedValue(mockRSSSources)

      const result = await exportOPML()

      expect(result).toContain('<?xml version="1.0" encoding="UTF-8"?>')
      expect(result).toContain('<opml version="2.0">')
      expect(result).toContain('Shaking Head News - RSS Sources')
      expect(result).toContain(mockRSSSources[0].name)
      expect(result).toContain(mockRSSSources[0].url)
    })

    it('should throw error when no sources to export', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })
      vi.mocked(getStorageItem).mockResolvedValue([])

      await expect(exportOPML()).rejects.toThrow('No RSS sources')
    })

    it('should include all sources in OPML', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })
      vi.mocked(getStorageItem).mockResolvedValue(mockRSSSources)

      const result = await exportOPML()

      mockRSSSources.forEach((source) => {
        expect(result).toContain(source.name)
        expect(result).toContain(source.url)
      })
    })
  })
})
