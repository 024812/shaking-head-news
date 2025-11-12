import { storage } from '../helpers/storage'

// Enhanced Cache Manager with TTL, size limits, statistics, and persistence
export interface ICacheEntry<T = unknown> {
  data: T
  timestamp: number
  ttl: number
  size: number
  key: string
}

export interface ICacheStats {
  hits: number
  misses: number
  totalRequests: number
  hitRate: number
  size: number
  entryCount: number
  lastCleared: number | null
}

export interface ICacheConfig {
  maxSize: number // in bytes
  maxEntries: number
  defaultTTL: number // in milliseconds
  cleanupInterval: number // in milliseconds
}

const CACHE_STORAGE_KEY = 'cache.manager.entries'
const CACHE_STATS_STORAGE_KEY = 'cache.manager.stats'
const CACHE_CONFIG_STORAGE_KEY = 'cache.manager.config'

export class EnhancedCacheManager {
  private cache = new Map<string, ICacheEntry>()
  private stats: ICacheStats = {
    hits: 0,
    misses: 0,
    totalRequests: 0,
    hitRate: 0,
    size: 0,
    entryCount: 0,
    lastCleared: null,
  }
  private config: ICacheConfig
  private cleanupTimer: ReturnType<typeof setInterval> | null = null
  private persistTimeout: ReturnType<typeof setTimeout> | null = null

  constructor(config: Partial<ICacheConfig> = {}) {
    this.config = {
      maxSize: config.maxSize || 50 * 1024 * 1024, // 50MB default
      maxEntries: config.maxEntries || 1000,
      defaultTTL: config.defaultTTL || 4 * 60 * 60 * 1000, // 4 hours default
      cleanupInterval: config.cleanupInterval || 5 * 60 * 1000, // 5 minutes
    }

    void this.restoreFromStorage()
    this.startCleanupTimer()
  }

  // Calculate size of data in bytes
  private calculateSize(data: unknown): number {
    try {
      const json = JSON.stringify(data)
      if (typeof TextEncoder !== 'undefined') {
        return new TextEncoder().encode(json).length
      }
      return json.length
    } catch {
      return 0
    }
  }

  // Update statistics
  private updateStats(hit: boolean) {
    this.stats.totalRequests++
    if (hit) {
      this.stats.hits++
    } else {
      this.stats.misses++
    }
    this.stats.hitRate = this.stats.hits / this.stats.totalRequests
    this.schedulePersist()
  }

  // Clean up expired entries
  private cleanup() {
    const now = Date.now()
    let cleanedSize = 0
    let cleanedEntries = 0

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
        cleanedSize += entry.size
        cleanedEntries++
      }
    }

    if (cleanedEntries > 0) {
      this.stats.size -= cleanedSize
      this.stats.entryCount -= cleanedEntries
      this.stats.lastCleared = now
    }

    // If still over size limit, remove oldest entries
    let evicted = false
    if (this.stats.size > this.config.maxSize) {
      evicted = this.evictOldestEntries() || evicted
    }

    if (cleanedEntries > 0 || evicted) {
      this.schedulePersist()
    }
  }

  // Evict oldest entries to free up space
  private evictOldestEntries(): boolean {
    const entries = Array.from(this.cache.entries())
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp)

    let freedSize = 0
    let removedEntries = 0
    const targetSize = this.config.maxSize * 0.8 // Free up 20% extra

    for (const [key, entry] of entries) {
      if (this.stats.size - freedSize <= targetSize) break

      this.cache.delete(key)
      freedSize += entry.size
      removedEntries++
    }

    if (removedEntries > 0) {
      this.stats.entryCount = Math.max(0, this.stats.entryCount - removedEntries)
      this.stats.size = Math.max(0, this.stats.size - freedSize)
      return true
    }

    return false
  }

  // Start cleanup timer
  private startCleanupTimer() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }

    if (typeof setInterval === 'function') {
      this.cleanupTimer = setInterval(() => {
        this.cleanup()
      }, this.config.cleanupInterval)
    }
  }

  private async restoreFromStorage(): Promise<void> {
    try {
      const [storedEntries, storedStats, storedConfig] = await Promise.all([
        storage.get<ICacheEntry[]>(CACHE_STORAGE_KEY),
        storage.get<ICacheStats>(CACHE_STATS_STORAGE_KEY),
        storage.get<ICacheConfig>(CACHE_CONFIG_STORAGE_KEY),
      ])

      if (storedConfig) {
        this.config = { ...this.config, ...storedConfig }
        this.startCleanupTimer()
      }

      if (storedEntries && Array.isArray(storedEntries)) {
        this.cache = new Map(storedEntries.map((entry) => [entry.key, entry]))
      }

      if (storedStats) {
        this.stats = { ...this.stats, ...storedStats }
      }

      this.recomputeUsage()
    } catch (error) {
      console.warn('Failed to restore cache state:', error)
    }
  }

  private recomputeUsage() {
    const entries = Array.from(this.cache.values())
    const size = entries.reduce((total, entry) => total + entry.size, 0)
    this.stats.size = size
    this.stats.entryCount = entries.length
  }

  private async persistToStorage(): Promise<void> {
    try {
      const entries = Array.from(this.cache.values())
      await Promise.all([
        storage.set(CACHE_STORAGE_KEY, entries),
        storage.set(CACHE_STATS_STORAGE_KEY, this.stats),
        storage.set(CACHE_CONFIG_STORAGE_KEY, this.config),
      ])
    } catch (error) {
      console.warn('Failed to persist cache state:', error)
    }
  }

  private schedulePersist() {
    if (typeof setTimeout !== 'function') return

    if (this.persistTimeout) {
      clearTimeout(this.persistTimeout)
    }

    this.persistTimeout = setTimeout(() => {
      this.persistTimeout = null
      void this.persistToStorage()
    }, 250)
  }

  // Set a value in cache
  set<T>(key: string, data: T, ttl?: number): void {
    const size = this.calculateSize(data)
    const entry: ICacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      size,
      key,
    }

    // Remove existing entry if any
    const existing = this.cache.get(key)
    if (existing) {
      this.stats.size -= existing.size
      this.stats.entryCount--
    }

    // Check size limits
    if (this.stats.size + size > this.config.maxSize) {
      this.evictOldestEntries()
    }

    // Check entry limit
    if (this.stats.entryCount >= this.config.maxEntries) {
      this.evictOldestEntries()
    }

    this.cache.set(key, entry)
    this.stats.size += size
    this.stats.entryCount++
    this.schedulePersist()
  }

  // Get a value from cache
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      this.updateStats(false)
      return null
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      this.stats.size -= entry.size
      this.stats.entryCount--
      this.updateStats(false)
      this.schedulePersist()
      return null
    }

    this.updateStats(true)
    return entry.data as T
  }

  // Check if key exists and is valid
  has(key: string): boolean {
    return this.get(key) !== null
  }

  // Delete a specific key
  delete(key: string): boolean {
    const entry = this.cache.get(key)
    if (entry) {
      this.cache.delete(key)
      this.stats.size -= entry.size
      this.stats.entryCount--
      this.schedulePersist()
      return true
    }
    return false
  }

  // Clear all cache
  clear(): void {
    this.cache.clear()
    this.stats.size = 0
    this.stats.entryCount = 0
    this.stats.lastCleared = Date.now()
    this.schedulePersist()
  }

  // Get cache statistics
  getStats(): ICacheStats {
    return { ...this.stats }
  }

  // Get all cache entries (for debugging/management)
  getAllEntries(): ICacheEntry[] {
    return Array.from(this.cache.values())
  }

  // Get cache configuration
  getConfig(): ICacheConfig {
    return { ...this.config }
  }

  // Update configuration
  updateConfig(newConfig: Partial<ICacheConfig>): void {
    this.config = { ...this.config, ...newConfig }

    // If cleanup interval changed, restart timer
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }
    this.startCleanupTimer()
    this.schedulePersist()
  }

  // Get size of a specific entry
  getEntrySize(key: string): number {
    const entry = this.cache.get(key)
    return entry ? entry.size : 0
  }

  // Get TTL of a specific entry
  getEntryTTL(key: string): number {
    const entry = this.cache.get(key)
    if (!entry) return 0

    const elapsed = Date.now() - entry.timestamp
    return Math.max(0, entry.ttl - elapsed)
  }

  // Destroy cache manager
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
    if (this.persistTimeout) {
      clearTimeout(this.persistTimeout)
      this.persistTimeout = null
    }
    this.clear()
  }
}

// Create global cache instance
export const cacheManager = new EnhancedCacheManager()

// Export for testing
// export { EnhancedCacheManager } // Already exported above
