/**
 * Logging Strategy Module
 * 
 * This module provides a structured logging system with different log levels
 * and output strategies based on the environment.
 * 
 * Features:
 * - Multiple log levels (debug, info, warn, error)
 * - Structured logging with context
 * - Environment-aware output
 * - Integration with error monitoring (Sentry)
 * - Performance logging
 * 
 * Usage:
 * ```typescript
 * import { logger } from '@/lib/logger'
 * 
 * logger.info('User logged in', { userId: '123' })
 * logger.error('Failed to fetch news', error, { source: 'api' })
 * ```
 */

import { captureException, captureMessage, addBreadcrumb } from './sentry'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogContext {
  [key: string]: any
}

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: LogContext
  error?: Error
}

/**
 * Logger configuration
 */
const config = {
  // Minimum log level to output
  minLevel: (process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel) || 
    (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  
  // Enable console output
  enableConsole: true,
  
  // Enable Sentry integration
  enableSentry: process.env.NODE_ENV === 'production',
  
  // Enable structured logging (JSON format)
  structured: process.env.NODE_ENV === 'production',
}

/**
 * Log level priorities
 */
const levelPriority: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

/**
 * Check if a log level should be output
 */
function shouldLog(level: LogLevel): boolean {
  return levelPriority[level] >= levelPriority[config.minLevel]
}

/**
 * Format log entry for output
 */
function formatLogEntry(entry: LogEntry): string {
  if (config.structured) {
    return JSON.stringify({
      level: entry.level,
      message: entry.message,
      timestamp: entry.timestamp,
      context: entry.context,
      error: entry.error ? {
        name: entry.error.name,
        message: entry.error.message,
        stack: entry.error.stack,
      } : undefined,
    })
  }

  const parts = [
    `[${entry.timestamp}]`,
    `[${entry.level.toUpperCase()}]`,
    entry.message,
  ]

  if (entry.context && Object.keys(entry.context).length > 0) {
    parts.push(JSON.stringify(entry.context))
  }

  if (entry.error) {
    parts.push(`\n${entry.error.stack || entry.error.message}`)
  }

  return parts.join(' ')
}

/**
 * Output log entry to console
 */
function outputToConsole(entry: LogEntry) {
  if (!config.enableConsole) return

  const formatted = formatLogEntry(entry)

  switch (entry.level) {
    case 'debug':
      console.debug(formatted)
      break
    case 'info':
      console.info(formatted)
      break
    case 'warn':
      console.warn(formatted)
      break
    case 'error':
      console.error(formatted)
      break
  }
}

/**
 * Send log entry to Sentry
 */
function sendToSentry(entry: LogEntry) {
  if (!config.enableSentry) return

  // Add breadcrumb for all logs
  addBreadcrumb({
    message: entry.message,
    level: entry.level === 'debug' ? 'info' : entry.level === 'warn' ? 'warning' : entry.level,
    category: 'log',
    data: entry.context,
  })

  // Capture errors and warnings
  if (entry.level === 'error' && entry.error) {
    captureException(entry.error, entry.context)
  } else if (entry.level === 'error' || entry.level === 'warn') {
    captureMessage(entry.message, entry.level === 'error' ? 'error' : 'warning')
  }
}

/**
 * Create a log entry
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  error?: Error,
  context?: LogContext
): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
    error,
  }
}

/**
 * Log a message
 */
function log(level: LogLevel, message: string, error?: Error, context?: LogContext) {
  if (!shouldLog(level)) return

  const entry = createLogEntry(level, message, error, context)

  outputToConsole(entry)
  sendToSentry(entry)
}

/**
 * Logger instance
 */
export const logger = {
  /**
   * Log debug message (development only)
   */
  debug(message: string, context?: LogContext) {
    log('debug', message, undefined, context)
  },

  /**
   * Log info message
   */
  info(message: string, context?: LogContext) {
    log('info', message, undefined, context)
  },

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext) {
    log('warn', message, undefined, context)
  },

  /**
   * Log error message
   */
  error(message: string, error?: Error, context?: LogContext) {
    log('error', message, error, context)
  },

  /**
   * Log API request
   */
  apiRequest(method: string, url: string, context?: LogContext) {
    this.debug(`API Request: ${method} ${url}`, context)
  },

  /**
   * Log API response
   */
  apiResponse(method: string, url: string, status: number, duration: number) {
    this.debug(`API Response: ${method} ${url} - ${status} (${duration}ms)`)
  },

  /**
   * Log API error
   */
  apiError(method: string, url: string, error: Error, context?: LogContext) {
    this.error(`API Error: ${method} ${url}`, error, context)
  },

  /**
   * Log user action
   */
  userAction(action: string, context?: LogContext) {
    this.info(`User Action: ${action}`, context)
  },

  /**
   * Log authentication event
   */
  auth(event: 'login' | 'logout' | 'register', userId?: string) {
    this.info(`Auth: ${event}`, { userId })
  },

  /**
   * Log database operation
   */
  database(operation: string, table: string, duration?: number) {
    this.debug(`Database: ${operation} ${table}`, { duration })
  },

  /**
   * Log cache operation
   */
  cache(operation: 'hit' | 'miss' | 'set' | 'delete', key: string) {
    this.debug(`Cache: ${operation} ${key}`)
  },

  /**
   * Log performance metric
   */
  performance(metric: string, value: number, unit: string = 'ms') {
    this.info(`Performance: ${metric} = ${value}${unit}`)
  },

  /**
   * Create a child logger with default context
   */
  child(defaultContext: LogContext) {
    return {
      debug: (message: string, context?: LogContext) =>
        this.debug(message, { ...defaultContext, ...context }),
      info: (message: string, context?: LogContext) =>
        this.info(message, { ...defaultContext, ...context }),
      warn: (message: string, context?: LogContext) =>
        this.warn(message, { ...defaultContext, ...context }),
      error: (message: string, error?: Error, context?: LogContext) =>
        this.error(message, error, { ...defaultContext, ...context }),
    }
  },
}

/**
 * Create a logger for a specific module
 */
export function createLogger(module: string) {
  return logger.child({ module })
}

/**
 * Measure and log execution time
 */
export async function logExecutionTime<T>(
  name: string,
  fn: () => T | Promise<T>,
  context?: LogContext
): Promise<T> {
  const start = performance.now()
  
  try {
    const result = await fn()
    const duration = performance.now() - start
    
    logger.performance(name, Math.round(duration), 'ms')
    
    return result
  } catch (error) {
    const duration = performance.now() - start
    
    logger.error(
      `${name} failed after ${Math.round(duration)}ms`,
      error as Error,
      context
    )
    
    throw error
  }
}

/**
 * Log and rethrow errors
 */
export function logError(message: string, error: unknown, context?: LogContext): never {
  const err = error instanceof Error ? error : new Error(String(error))
  logger.error(message, err, context)
  throw err
}

/**
 * Safe logging wrapper that catches errors
 */
export function safeLog(fn: () => void) {
  try {
    fn()
  } catch (error) {
    console.error('[Logger] Failed to log:', error)
  }
}

// Export default logger
export default logger
