import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  recordRotation,
  getStats,
  getTodayStats,
  getWeekStats,
  getMonthStats,
  getSummaryStats,
  checkHealthReminder,
  checkDailyGoal,
} from '@/lib/actions/stats'
import { mockUserStats } from '@/tests/utils/test-utils'

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/storage', () => ({
  getStorageItem: vi.fn(),
  setStorageItem: vi.fn(),
  StorageKeys: {
    userStats: (userId: string, date: string) => `user:${userId}:stats:${date}`,
  },
}))

vi.mock('@/lib/rate-limit', () => ({
  rateLimitByUser: vi.fn().mockResolvedValue({ success: true }),
  rateLimitByAction: vi.fn().mockResolvedValue({ success: true }),
  RateLimitTiers: {
    STANDARD: { limit: 30, window: 60 },
    RELAXED: { limit: 100, window: 60 },
  },
}))

vi.mock('@/lib/utils/error-handler', () => ({
  logError: vi.fn(),
  validateOrThrow: vi.fn((schema, data) => data),
  AuthError: class AuthError extends Error {},
}))

import { auth } from '@/lib/auth'
import { getStorageItem, setStorageItem } from '@/lib/storage'
import { rateLimitByUser } from '@/lib/rate-limit'

describe('Stats Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io'
    process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token'
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('recordRotation', () => {
    it('should return null for unauthenticated users', async () => {
      vi.mocked(auth).mockResolvedValue(null)

      const result = await recordRotation(5, 30)

      expect(result).toBeNull()
      expect(setStorageItem).not.toHaveBeenCalled()
    })

    it('should record rotation for authenticated users', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })
      vi.mocked(getStorageItem).mockResolvedValue(null)
      vi.mocked(setStorageItem).mockResolvedValue(undefined)

      const result = await recordRotation(5, 30)

      expect(result).toBeTruthy()
      expect(result?.rotationCount).toBe(1)
      expect(result?.totalDuration).toBe(30)
      expect(result?.records).toHaveLength(1)
      expect(setStorageItem).toHaveBeenCalled()
    })

    it('should append to existing stats', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })
      vi.mocked(getStorageItem).mockResolvedValue(mockUserStats)
      vi.mocked(setStorageItem).mockResolvedValue(undefined)

      const result = await recordRotation(5, 30)

      expect(result?.rotationCount).toBe(mockUserStats.rotationCount + 1)
      expect(result?.totalDuration).toBe(mockUserStats.totalDuration + 30)
    })

    it('should respect rate limits', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })
      vi.mocked(rateLimitByUser).mockResolvedValue({ success: false })

      const result = await recordRotation(5, 30)

      expect(result).toBeNull()
      expect(setStorageItem).not.toHaveBeenCalled()
    })

    it('should validate angle range', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })

      const result = await recordRotation(200, 30)

      expect(result).toBeNull()
    })

    it('should validate duration range', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })

      const result = await recordRotation(5, 4000)

      expect(result).toBeNull()
    })

    it('should limit records to 100 items', async () => {
      const statsWithManyRecords = {
        ...mockUserStats,
        records: Array(100).fill({
          timestamp: Date.now(),
          angle: 5,
          duration: 30,
        }),
      }

      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })
      vi.mocked(getStorageItem).mockResolvedValue(statsWithManyRecords)
      vi.mocked(setStorageItem).mockResolvedValue(undefined)

      const result = await recordRotation(5, 30)

      expect(result?.records).toHaveLength(100)
    })
  })

  describe('getStats', () => {
    it('should throw error for unauthenticated users', async () => {
      vi.mocked(auth).mockResolvedValue(null)

      await expect(getStats('2024-01-01', '2024-01-07')).rejects.toThrow('sign in')
    })

    it('should fetch stats for date range', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })
      vi.mocked(getStorageItem).mockResolvedValue(mockUserStats)

      const result = await getStats('2024-01-01', '2024-01-03')

      expect(result).toHaveLength(3)
      expect(getStorageItem).toHaveBeenCalledTimes(3)
    })

    it('should respect rate limits', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })
      vi.mocked(rateLimitByUser).mockResolvedValue({ success: false })

      await expect(getStats('2024-01-01', '2024-01-07')).rejects.toThrow('Too many requests')
    })

    it('should validate date format', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })

      await expect(getStats('invalid-date', '2024-01-07')).rejects.toThrow('Invalid date format')
    })

    it('should reject date range exceeding 365 days', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })

      await expect(getStats('2023-01-01', '2024-12-31')).rejects.toThrow('cannot exceed 365 days')
    })

    it('should reject invalid date range', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })

      await expect(getStats('2024-01-07', '2024-01-01')).rejects.toThrow('Start date must be before')
    })

    it('should skip invalid stats data', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })
      vi.mocked(getStorageItem)
        .mockResolvedValueOnce(mockUserStats)
        .mockResolvedValueOnce({ invalid: 'data' })
        .mockResolvedValueOnce(mockUserStats)

      const result = await getStats('2024-01-01', '2024-01-03')

      expect(result.length).toBeLessThan(3)
    })
  })

  describe('getTodayStats', () => {
    it('should fetch today stats', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })
      vi.mocked(getStorageItem).mockResolvedValue(mockUserStats)

      const result = await getTodayStats()

      expect(result).toBeTruthy()
      expect(getStorageItem).toHaveBeenCalled()
    })

    it('should return null when no stats exist', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })
      vi.mocked(getStorageItem).mockResolvedValue(null)

      const result = await getTodayStats()

      expect(result).toBeNull()
    })
  })

  describe('getWeekStats', () => {
    it('should fetch week stats', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })
      vi.mocked(getStorageItem).mockResolvedValue(mockUserStats)

      const result = await getWeekStats()

      expect(result).toHaveLength(7)
    })
  })

  describe('getMonthStats', () => {
    it('should fetch month stats', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })
      vi.mocked(getStorageItem).mockResolvedValue(mockUserStats)

      const result = await getMonthStats()

      expect(result).toHaveLength(30)
    })
  })

  describe('getSummaryStats', () => {
    it('should throw error for unauthenticated users', async () => {
      vi.mocked(auth).mockResolvedValue(null)

      await expect(getSummaryStats()).rejects.toThrow('sign in')
    })

    it('should return empty stats when Redis is not configured', async () => {
      delete process.env.UPSTASH_REDIS_REST_URL
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })

      const result = await getSummaryStats()

      expect(result.today.count).toBe(0)
      expect(result.week.count).toBe(0)
      expect(result.month.count).toBe(0)
    })

    it('should calculate summary stats', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })
      vi.mocked(getStorageItem).mockResolvedValue(mockUserStats)

      const result = await getSummaryStats()

      expect(result.today).toBeTruthy()
      expect(result.week).toBeTruthy()
      expect(result.month).toBeTruthy()
      expect(result.dailyData).toBeTruthy()
      expect(result.monthlyData).toBeTruthy()
    })
  })

  describe('checkHealthReminder', () => {
    it('should return false for unauthenticated users', async () => {
      vi.mocked(auth).mockResolvedValue(null)

      const result = await checkHealthReminder()

      expect(result.shouldRemind).toBe(false)
    })

    it('should remind when no stats exist', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })
      vi.mocked(getStorageItem).mockResolvedValue(null)

      const result = await checkHealthReminder()

      expect(result.shouldRemind).toBe(true)
    })

    it('should remind when last rotation was over 2 hours ago', async () => {
      const oldStats = {
        ...mockUserStats,
        records: [
          {
            timestamp: Date.now() - 3 * 60 * 60 * 1000, // 3 hours ago
            angle: 5,
            duration: 30,
          },
        ],
      }

      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })
      vi.mocked(getStorageItem).mockResolvedValue(oldStats)

      const result = await checkHealthReminder()

      expect(result.shouldRemind).toBe(true)
    })

    it('should not remind when last rotation was recent', async () => {
      const recentStats = {
        ...mockUserStats,
        records: [
          {
            timestamp: Date.now() - 30 * 60 * 1000, // 30 minutes ago
            angle: 5,
            duration: 30,
          },
        ],
      }

      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })
      vi.mocked(getStorageItem).mockResolvedValue(recentStats)

      const result = await checkHealthReminder()

      expect(result.shouldRemind).toBe(false)
    })
  })

  describe('checkDailyGoal', () => {
    it('should return not achieved when no stats exist', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })
      vi.mocked(getStorageItem).mockResolvedValue(null)

      const result = await checkDailyGoal(30)

      expect(result.achieved).toBe(false)
      expect(result.current).toBe(0)
      expect(result.progress).toBe(0)
    })

    it('should return achieved when goal is met', async () => {
      const statsWithGoal = {
        ...mockUserStats,
        rotationCount: 30,
      }

      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })
      vi.mocked(getStorageItem).mockResolvedValue(statsWithGoal)

      const result = await checkDailyGoal(30)

      expect(result.achieved).toBe(true)
      expect(result.current).toBe(30)
      expect(result.progress).toBe(100)
    })

    it('should calculate progress correctly', async () => {
      const statsWithProgress = {
        ...mockUserStats,
        rotationCount: 15,
      }

      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })
      vi.mocked(getStorageItem).mockResolvedValue(statsWithProgress)

      const result = await checkDailyGoal(30)

      expect(result.achieved).toBe(false)
      expect(result.current).toBe(15)
      expect(result.progress).toBe(50)
    })

    it('should cap progress at 100%', async () => {
      const statsExceedingGoal = {
        ...mockUserStats,
        rotationCount: 50,
      }

      vi.mocked(auth).mockResolvedValue({
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        expires: new Date().toISOString(),
      })
      vi.mocked(getStorageItem).mockResolvedValue(statsExceedingGoal)

      const result = await checkDailyGoal(30)

      expect(result.achieved).toBe(true)
      expect(result.progress).toBe(100)
    })
  })
})
