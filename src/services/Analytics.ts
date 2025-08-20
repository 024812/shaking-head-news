// Analytics & Tracking system for user behavior and performance metrics
import { storage } from '../helpers/storage'

export interface IAnalyticsEvent {
  id: string
  type: string
  category: string
  action: string
  label?: string
  value?: number
  timestamp: number
  sessionId: string
  userId?: string
  metadata?: Record<string, unknown>
}

export interface IUserSession {
  id: string
  startTime: number
  endTime?: number
  duration?: number
  pageViews: number
  interactions: number
  newsRead: number
  rotationsCompleted: number
  modeChanges: number
  sourcesUsed: string[]
  deviceInfo: {
    userAgent: string
    platform: string
    language: string
    screenResolution?: string
  }
}

export interface IAnalyticsStats {
  totalSessions: number
  totalPageViews: number
  totalInteractions: number
  totalNewsRead: number
  totalRotations: number
  averageSessionDuration: number
  averageNewsPerSession: number
  bounceRate: number
  popularSources: { source: string; count: number }[]
  hourlyUsage: number[]
  dailyUsage: Record<string, number>
  modeUsage: Record<string, number>
}

export interface IAnalyticsConfig {
  enabled: boolean
  maxEvents: number
  maxSessions: number
  sessionTimeout: number // in milliseconds
  analyticsRetention: number // in milliseconds
  enablePerformanceTracking: boolean
  enableUserTracking: boolean
}

export class AnalyticsTracker {
  private config: IAnalyticsConfig
  private events: IAnalyticsEvent[] = []
  private sessions: IUserSession[] = []
  private currentSession: IUserSession | null = null
  private eventQueue: IAnalyticsEvent[] = []
  private isInitialized = false

  constructor(config: Partial<IAnalyticsConfig> = {}) {
    this.config = {
      enabled: config.enabled ?? true,
      maxEvents: config.maxEvents || 10000,
      maxSessions: config.maxSessions || 1000,
      sessionTimeout: config.sessionTimeout || 30 * 60 * 1000, // 30 minutes
      analyticsRetention: config.analyticsRetention ?? 90 * 24 * 60 * 60 * 1000, // 90 days
      enablePerformanceTracking: config.enablePerformanceTracking ?? true,
      enableUserTracking: config.enableUserTracking ?? true,
    }
  }

  // Initialize analytics
  async initialize(): Promise<void> {
    if (this.isInitialized || !this.config.enabled) return

    try {
      // Load stored data
      await this.loadStoredData()

      // Start or continue session
      await this.startSession()

      // Track page view
      this.trackEvent('page_view', 'engagement', 'page_load')

      // Set up event listeners
      this.setupEventListeners()

      // Periodic cleanup
      this.startCleanupTimer()

      this.isInitialized = true
      console.log('Analytics initialized')
    } catch (error) {
      console.error('Failed to initialize analytics:', error)
    }
  }

  // Load stored analytics data
  private async loadStoredData(): Promise<void> {
    try {
      const storedEvents = await storage.get<IAnalyticsEvent[]>('analytics.events')
      const storedSessions = await storage.get<IUserSession[]>('analytics.sessions')

      if (storedEvents) {
        this.events = storedEvents.slice(-this.config.maxEvents)
      }

      if (storedSessions) {
        this.sessions = storedSessions.slice(-this.config.maxSessions)
      }
    } catch (error) {
      console.warn('Failed to load stored analytics data:', error)
    }
  }

  // Save analytics data
  private async saveData(): Promise<void> {
    try {
      await storage.set('analytics.events', this.events)
      await storage.set('analytics.sessions', this.sessions)
    } catch (error) {
      console.warn('Failed to save analytics data:', error)
    }
  }

  // Start or continue user session
  private async startSession(): Promise<void> {
    const now = Date.now()

    // Check if we have an active session
    if (this.currentSession && now - this.currentSession.startTime < this.config.sessionTimeout) {
      // Continue existing session
      return
    }

    // End current session if exists
    if (this.currentSession) {
      this.endSession()
    }

    // Create new session
    this.currentSession = {
      id: this.generateSessionId(),
      startTime: now,
      pageViews: 0,
      interactions: 0,
      newsRead: 0,
      rotationsCompleted: 0,
      modeChanges: 0,
      sourcesUsed: [],
      deviceInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenResolution: `${screen.width}x${screen.height}`,
      },
    }

    this.sessions.push(this.currentSession)
    await this.saveData()
  }

  // End current session
  private endSession(): void {
    if (!this.currentSession) return

    this.currentSession.endTime = Date.now()
    this.currentSession.duration = this.currentSession.endTime - this.currentSession.startTime

    // Track session end
    this.trackEvent('session_end', 'session', 'complete', this.currentSession.duration)

    this.currentSession = null
  }

  // Generate unique session ID
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Generate unique event ID
  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Track analytics event
  trackEvent(
    action: string,
    category: string,
    label?: string,
    value?: number,
    metadata?: Record<string, unknown>
  ): void {
    if (!this.config.enabled || !this.isInitialized) return

    const event: IAnalyticsEvent = {
      id: this.generateEventId(),
      type: 'event',
      category,
      action,
      label,
      value,
      timestamp: Date.now(),
      sessionId: this.currentSession?.id || '',
      metadata,
    }

    this.events.push(event)
    this.eventQueue.push(event)

    // Update session stats
    if (this.currentSession) {
      this.currentSession.interactions++

      switch (category) {
        case 'engagement':
          if (action === 'news_read') this.currentSession.newsRead++
          break
        case 'rotation':
          if (action === 'completed') this.currentSession.rotationsCompleted++
          break
        case 'mode':
          if (action === 'change') this.currentSession.modeChanges++
          break
      }
    }

    // Limit events array size
    if (this.events.length > this.config.maxEvents) {
      this.events = this.events.slice(-this.config.maxEvents)
    }

    // Save periodically (debounced)
    this.debouncedSave()
  }

  // Track page view
  trackPageView(path = '/'): void {
    if (!this.config.enabled || !this.isInitialized) return

    this.trackEvent('page_view', 'engagement', path)

    if (this.currentSession) {
      this.currentSession.pageViews++
    }
  }

  // Track news interaction
  trackNewsInteraction(articleId: string, action: 'click' | 'read' | 'share' | 'bookmark', source: string): void {
    this.trackEvent('news_interaction', 'engagement', action, undefined, {
      articleId,
      source,
    })

    if (this.currentSession && !this.currentSession.sourcesUsed.includes(source)) {
      this.currentSession.sourcesUsed.push(source)
    }
  }

  // Track rotation event
  trackRotation(mode: string, angle: number, duration: number): void {
    this.trackEvent('rotation', 'rotation', mode, duration, {
      angle,
      mode,
    })
  }

  // Track mode change
  trackModeChange(fromMode: string, toMode: string): void {
    this.trackEvent('mode_change', 'mode', 'change', undefined, {
      from: fromMode,
      to: toMode,
    })
  }

  // Track performance metrics
  trackPerformance(name: string, duration: number): void {
    if (!this.config.enablePerformanceTracking) return

    this.trackEvent('performance', 'performance', name, duration)
  }

  // Track error
  trackError(error: Error, context?: string): void {
    this.trackEvent('error', 'error', error.name, undefined, {
      message: error.message,
      stack: error.stack,
      context,
    })
  }

  // Setup event listeners
  private setupEventListeners(): void {
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent('page_hide', 'engagement', 'visibility')
      } else {
        this.trackEvent('page_show', 'engagement', 'visibility')
        this.startSession() // Resume session
      }
    })

    // Track before unload
    window.addEventListener('beforeunload', () => {
      this.endSession()
      this.saveData()
    })

    // Track online/offline status
    window.addEventListener('online', () => {
      this.trackEvent('online', 'network', 'status')
    })

    window.addEventListener('offline', () => {
      this.trackEvent('offline', 'network', 'status')
    })
  }

  // Debounced save
  private saveTimeout: number | null = null
  private debouncedSave(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout)
    }

    this.saveTimeout = window.setTimeout(() => {
      this.saveData()
    }, 1000)
  }

  // Start cleanup timer
  private startCleanupTimer(): void {
    setInterval(
      () => {
        this.cleanupOldData()
      },
      60 * 60 * 1000
    ) // Clean up every hour
  }

  // Clean up old data
  private cleanupOldData(): void {
    const now = Date.now()
    const cutoffTime = now - this.config.analyticsRetention

    // Clean old events
    this.events = this.events.filter((event) => event.timestamp > cutoffTime)

    // Clean old sessions
    this.sessions = this.sessions.filter(
      (session) => session.startTime > cutoffTime || (session.endTime && session.endTime > cutoffTime)
    )

    this.saveData()
  }

  // Get analytics statistics
  getStats(): IAnalyticsStats {
    const now = Date.now()
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000

    // Filter recent data
    const recentSessions = this.sessions.filter((s) => s.startTime > thirtyDaysAgo)
    const recentEvents = this.events.filter((e) => e.timestamp > thirtyDaysAgo)

    // Calculate stats
    const totalPageViews = recentSessions.reduce((sum, s) => sum + s.pageViews, 0)
    const totalInteractions = recentSessions.reduce((sum, s) => sum + s.interactions, 0)
    const totalNewsRead = recentSessions.reduce((sum, s) => sum + s.newsRead, 0)
    const totalRotations = recentSessions.reduce((sum, s) => sum + s.rotationsCompleted, 0)

    const completedSessions = recentSessions.filter((s) => s.duration)
    const averageSessionDuration =
      completedSessions.length > 0
        ? completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / completedSessions.length
        : 0

    const averageNewsPerSession = recentSessions.length > 0 ? totalNewsRead / recentSessions.length : 0

    const bounceRate =
      recentSessions.length > 0
        ? (recentSessions.filter((s) => s.pageViews <= 1 && s.interactions <= 1).length / recentSessions.length) * 100
        : 0

    // Popular sources
    const sourceCounts = new Map<string, number>()
    recentSessions.forEach((session) => {
      session.sourcesUsed.forEach((source) => {
        sourceCounts.set(source, (sourceCounts.get(source) || 0) + 1)
      })
    })

    const popularSources = Array.from(sourceCounts.entries())
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Hourly usage
    const hourlyUsage = new Array(24).fill(0)
    recentEvents.forEach((event) => {
      const hour = new Date(event.timestamp).getHours()
      hourlyUsage[hour]++
    })

    // Daily usage
    const dailyUsage: Record<string, number> = {}
    recentEvents.forEach((event) => {
      const date = new Date(event.timestamp).toISOString().split('T')[0]
      dailyUsage[date] = (dailyUsage[date] || 0) + 1
    })

    // Mode usage
    const modeUsage: Record<string, number> = {}
    recentEvents
      .filter((e) => e.category === 'mode')
      .forEach((event) => {
        const mode = event.metadata?.to || event.label || 'unknown'
        modeUsage[mode] = (modeUsage[mode] || 0) + 1
      })

    return {
      totalSessions: recentSessions.length,
      totalPageViews,
      totalInteractions,
      totalNewsRead,
      totalRotations,
      averageSessionDuration,
      averageNewsPerSession,
      bounceRate,
      popularSources,
      hourlyUsage,
      dailyUsage,
      modeUsage,
    }
  }

  // Get raw events for export
  getEvents(filters?: { startDate?: Date; endDate?: Date; category?: string; action?: string }): IAnalyticsEvent[] {
    let filtered = [...this.events]

    if (filters) {
      if (filters.startDate) {
        filtered = filtered.filter((e) => e.timestamp >= (filters.startDate?.getTime() ?? 0))
      }
      if (filters.endDate) {
        filtered = filtered.filter((e) => e.timestamp <= (filters.endDate?.getTime() ?? Number.MAX_SAFE_INTEGER))
      }
      if (filters.category) {
        filtered = filtered.filter((e) => e.category === filters.category)
      }
      if (filters.action) {
        filtered = filtered.filter((e) => e.action === filters.action)
      }
    }

    return filtered
  }

  // Export analytics data
  exportData(): {
    events: IAnalyticsEvent[]
    sessions: IUserSession[]
    stats: IAnalyticsStats
    exportedAt: number
  } {
    return {
      events: this.events,
      sessions: this.sessions,
      stats: this.getStats(),
      exportedAt: Date.now(),
    }
  }

  // Clear all analytics data
  async clearData(): Promise<void> {
    this.events = []
    this.sessions = []
    this.currentSession = null
    await storage.remove('analytics.events')
    await storage.remove('analytics.sessions')
  }

  // Get configuration
  getConfig(): IAnalyticsConfig {
    return { ...this.config }
  }

  // Update configuration
  updateConfig(newConfig: Partial<IAnalyticsConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  // Destroy analytics
  destroy(): void {
    this.endSession()
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout)
    }
    this.isInitialized = false
  }
}

// Create global analytics instance
export const analytics = new AnalyticsTracker()

// Initialize analytics when DOM is ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    analytics.initialize().catch(console.error)
  })
}

// Export for testing
// export { AnalyticsTracker } // Already exported above
