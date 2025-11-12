'use server'

import { auth } from '@/lib/auth'
import { getStorageItem, setStorageItem, StorageKeys } from '@/lib/storage'
import { UserStatsSchema, RotationRecord, UserStats } from '@/types/stats'
import { AuthError, logError, validateOrThrow } from '@/lib/utils/error-handler'
import { rateLimitByUser, RateLimitTiers } from '@/lib/rate-limit'

/**
 * 记录旋转动作
 * 需求: 8.1 - 完成旋转周期时存储运动记录
 * 包含速率限制以防止滥用
 */
export async function recordRotation(angle: number, duration: number) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return null // 未登录用户不记录
    }

    // 速率限制：每分钟最多100次记录（防止恶意刷数据）
    const rateLimitResult = await rateLimitByUser(session.user.id, {
      ...RateLimitTiers.RELAXED,
    })

    if (!rateLimitResult.success) {
      // 静默失败，不影响用户体验
      console.warn('Rate limit exceeded for recordRotation')
      return null
    }

    // 验证输入参数
    if (typeof angle !== 'number' || typeof duration !== 'number') {
      throw new Error('Invalid input parameters')
    }

    // 限制角度范围 (-180 到 180)
    if (angle < -180 || angle > 180) {
      throw new Error('Angle must be between -180 and 180')
    }

    // 限制持续时间范围 (0 到 3600秒，即1小时)
    if (duration < 0 || duration > 3600) {
      throw new Error('Duration must be between 0 and 3600 seconds')
    }

    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    const key = StorageKeys.userStats(session.user.id, today)

    const existingStats = await getStorageItem<UserStats>(key)

    const stats: UserStats = existingStats || {
      userId: session.user.id,
      date: today,
      rotationCount: 0,
      totalDuration: 0,
      records: [],
    }

    const record: RotationRecord = {
      timestamp: Date.now(),
      angle,
      duration,
    }

    stats.rotationCount += 1
    stats.totalDuration += duration
    stats.records.push(record)

    // 只保留最近 100 条记录以控制存储大小
    if (stats.records.length > 100) {
      stats.records = stats.records.slice(-100)
    }

    // 验证数据
    const validatedStats = validateOrThrow(UserStatsSchema, stats)

    // 保留 90 天
    await setStorageItem(key, validatedStats, 60 * 60 * 24 * 90)

    return validatedStats
  } catch (error) {
    logError(error, {
      action: 'recordRotation',
      angle,
      duration,
    })
    return null
  }
}

/**
 * 获取统计数据
 * 需求: 8.2 - 读取并渲染每日、每周和每月的运动次数
 * 包含速率限制和输入验证
 */
export async function getStats(startDate: string, endDate: string) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      throw new AuthError('Please sign in to view statistics')
    }

    // 速率限制：每分钟最多30次查询
    const rateLimitResult = await rateLimitByUser(session.user.id, {
      ...RateLimitTiers.STANDARD,
    })

    if (!rateLimitResult.success) {
      throw new Error('Too many requests. Please try again later.')
    }

    // 验证日期格式
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      throw new Error('Invalid date format. Use YYYY-MM-DD')
    }

    const stats: UserStats[] = []
    const start = new Date(startDate)
    const end = new Date(endDate)

    // 限制查询范围不超过1年
    const daysDiff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    if (daysDiff > 365) {
      throw new Error('Date range cannot exceed 365 days')
    }

    if (start > end) {
      throw new Error('Start date must be before end date')
    }

    // 遍历日期范围
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      const key = StorageKeys.userStats(session.user.id, dateStr)
      const dayStat = await getStorageItem<UserStats>(key)

      if (dayStat) {
        try {
          stats.push(validateOrThrow(UserStatsSchema, dayStat))
        } catch (error) {
          logError(error, {
            action: 'getStats',
            date: dateStr,
          })
        }
      }
    }

    return stats
  } catch (error) {
    logError(error, {
      action: 'getStats',
      startDate,
      endDate,
    })
    throw error
  }
}

/**
 * 获取今日统计
 * 需求: 8.2 - 显示今日运动数据
 */
export async function getTodayStats() {
  const today = new Date().toISOString().split('T')[0]
  const stats = await getStats(today, today)
  return stats[0] || null
}

/**
 * 获取本周统计
 * 需求: 8.2 - 显示本周运动数据
 */
export async function getWeekStats() {
  const today = new Date()
  const weekAgo = new Date(today)
  weekAgo.setDate(today.getDate() - 6) // 包括今天共7天

  const startDate = weekAgo.toISOString().split('T')[0]
  const endDate = today.toISOString().split('T')[0]

  return await getStats(startDate, endDate)
}

/**
 * 获取本月统计
 * 需求: 8.2 - 显示本月运动数据
 */
export async function getMonthStats() {
  const today = new Date()
  const monthAgo = new Date(today)
  monthAgo.setDate(today.getDate() - 29) // 包括今天共30天

  const startDate = monthAgo.toISOString().split('T')[0]
  const endDate = today.toISOString().split('T')[0]

  return await getStats(startDate, endDate)
}

/**
 * 获取汇总统计数据
 * 需求: 8.2, 8.5 - 提供可视化图表所需的汇总数据
 */
export async function getSummaryStats() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      throw new AuthError('Please sign in to view statistics')
    }

    // 检查 Redis 是否配置
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      console.warn('[getSummaryStats] Redis not configured, returning empty stats')
      return {
        today: { count: 0, duration: 0 },
        week: { count: 0, duration: 0 },
        month: { count: 0, duration: 0 },
        dailyData: [],
        monthlyData: [],
      }
    }

    const [todayStats, weekStats, monthStats] = await Promise.all([
      getTodayStats(),
      getWeekStats(),
      getMonthStats(),
    ])

    // 计算汇总数据
    const weekTotal = weekStats.reduce(
      (acc, stat) => ({
        count: acc.count + stat.rotationCount,
        duration: acc.duration + stat.totalDuration,
      }),
      { count: 0, duration: 0 }
    )

    const monthTotal = monthStats.reduce(
      (acc, stat) => ({
        count: acc.count + stat.rotationCount,
        duration: acc.duration + stat.totalDuration,
      }),
      { count: 0, duration: 0 }
    )

    return {
      today: {
        count: todayStats?.rotationCount || 0,
        duration: todayStats?.totalDuration || 0,
      },
      week: weekTotal,
      month: monthTotal,
      dailyData: weekStats.map((stat) => ({
        date: stat.date,
        count: stat.rotationCount,
        duration: stat.totalDuration,
      })),
      monthlyData: monthStats.map((stat) => ({
        date: stat.date,
        count: stat.rotationCount,
        duration: stat.totalDuration,
      })),
    }
  } catch (error) {
    logError(error, {
      action: 'getSummaryStats',
    })
    throw error
  }
}

/**
 * 检查是否需要发送健康提醒
 * 需求: 8.3 - 连续2小时未运动时发送提醒
 */
export async function checkHealthReminder() {
  const session = await auth()

  if (!session?.user?.id) {
    return { shouldRemind: false, lastRotationTime: null }
  }

  const todayStats = await getTodayStats()

  if (!todayStats || todayStats.records.length === 0) {
    return { shouldRemind: true, lastRotationTime: null }
  }

  // 获取最后一次旋转时间
  const lastRecord = todayStats.records[todayStats.records.length - 1]
  const lastRotationTime = lastRecord.timestamp
  const now = Date.now()
  const twoHoursInMs = 2 * 60 * 60 * 1000

  const shouldRemind = now - lastRotationTime > twoHoursInMs

  return { shouldRemind, lastRotationTime }
}

/**
 * 检查是否达到每日目标
 * 需求: 8.4 - 达到每日目标时显示鼓励消息
 */
export async function checkDailyGoal(dailyGoal: number) {
  const todayStats = await getTodayStats()

  if (!todayStats) {
    return {
      achieved: false,
      current: 0,
      goal: dailyGoal,
      progress: 0,
    }
  }

  const achieved = todayStats.rotationCount >= dailyGoal
  const progress = Math.min((todayStats.rotationCount / dailyGoal) * 100, 100)

  return {
    achieved,
    current: todayStats.rotationCount,
    goal: dailyGoal,
    progress,
  }
}
