import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getUserSettings, updateSettings, resetSettings } from '@/lib/actions/settings'
import { mockUserSettings } from '@/tests/utils/test-utils'

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/storage', () => ({
  getStorageItem: vi.fn(),
  setStorageItem: vi.fn(),
  StorageKeys: {
    userSettings: (userId: string) => `user:${userId}:settings`,
  },
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/rate-limit', () => ({
  rateLimitByUser: vi.fn().mockResolvedValue({ success: true }),
  RateLimitTiers: {
    STANDARD: { limit: 30, window: 60 },
    STRICT: { limit: 5, window: 900 },
  },
}))

vi.mock('@/lib/utils/input-validation', () => ({
  sanitizeObject: vi.fn((obj) => obj),
}))

import { auth } from '@/lib/auth'
import { getStorageItem, setStorageItem } from '@/lib/storage'
import { revalidatePath } from 'next/cache'
import { rateLimitByUser } from '@/lib/rate-limit'

describe('Settings Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Set default environment variables
    process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io'
    process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token'
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('getUserSettings', () => {
    it('should return default settings for unauthenticated users', async () => {
      vi.mocked(auth).mockResolvedValue(null)

      const settings = await getUserSettings()

      expect(settings.userId).toBe('')
      expect(settings.language).toBe('zh')
      expect(settings.theme).toBe('system')
    })

    it('should return default settings when Redis is not configured', async () => {
      delete process.env.UPSTASH_REDIS_REST_URL
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })

      const settings = await getUserSettings()

      expect(settings.userId).toBe('test-user-id')
      expect(settings.language).toBe('zh')
    })

    it('should return stored settings for authenticated users', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })
      vi.mocked(getStorageItem).mockResolvedValue(mockUserSettings)

      const settings = await getUserSettings()

      expect(settings).toEqual(mockUserSettings)
      expect(getStorageItem).toHaveBeenCalledWith('user:test-user-id:settings')
    })

    it('should return default settings when no stored settings exist', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })
      vi.mocked(getStorageItem).mockResolvedValue(null)

      const settings = await getUserSettings()

      expect(settings.userId).toBe('test-user-id')
      expect(settings.language).toBe('zh')
    })

    it('should return default settings on storage error', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })
      vi.mocked(getStorageItem).mockRejectedValue(new Error('Storage error'))

      const settings = await getUserSettings()

      expect(settings.userId).toBe('test-user-id')
      expect(settings.language).toBe('zh')
    })
  })

  describe('updateSettings', () => {
    it('should return error for unauthenticated users', async () => {
      vi.mocked(auth).mockResolvedValue(null)

      const result = await updateSettings({ language: 'en' })

      expect(result.success).toBe(false)
      expect(result.error).toContain('sign in')
    })

    it('should update settings for authenticated users', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })
      vi.mocked(getStorageItem).mockResolvedValue(mockUserSettings)
      vi.mocked(setStorageItem).mockResolvedValue(undefined)

      const result = await updateSettings({ language: 'en' })

      expect(result.success).toBe(true)
      expect(result.settings?.language).toBe('en')
      expect(setStorageItem).toHaveBeenCalled()
      expect(revalidatePath).toHaveBeenCalledWith('/')
      expect(revalidatePath).toHaveBeenCalledWith('/settings')
    })

    it('should respect rate limits', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })
      vi.mocked(rateLimitByUser).mockResolvedValue({ success: false })

      const result = await updateSettings({ language: 'en' })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Too many requests')
    })

    it('should preserve userId when updating settings', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })
      vi.mocked(getStorageItem).mockResolvedValue(mockUserSettings)
      vi.mocked(setStorageItem).mockResolvedValue(undefined)

      const result = await updateSettings({ userId: 'malicious-id', language: 'en' })

      expect(result.success).toBe(true)
      expect(result.settings?.userId).toBe('test-user-id')
    })

    it('should handle storage errors gracefully', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })
      vi.mocked(getStorageItem).mockResolvedValue(mockUserSettings)
      vi.mocked(setStorageItem).mockRejectedValue(new Error('Storage error'))

      const result = await updateSettings({ language: 'en' })

      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
    })
  })

  describe('resetSettings', () => {
    it('should return error for unauthenticated users', async () => {
      vi.mocked(auth).mockResolvedValue(null)

      const result = await resetSettings()

      expect(result.success).toBe(false)
      expect(result.error).toContain('sign in')
    })

    it('should reset settings to defaults for authenticated users', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })
      vi.mocked(setStorageItem).mockResolvedValue(undefined)

      const result = await resetSettings()

      expect(result.success).toBe(true)
      expect(result.settings?.language).toBe('zh')
      expect(result.settings?.theme).toBe('system')
      expect(setStorageItem).toHaveBeenCalled()
    })

    it('should respect rate limits', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })
      vi.mocked(rateLimitByUser).mockResolvedValue({ success: false })

      const result = await resetSettings()

      expect(result.success).toBe(false)
      expect(result.error).toContain('Too many')
    })
  })
})
