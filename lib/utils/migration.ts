/**
 * 用户设置迁移工具
 * 用于从旧版本浏览器扩展导入设置到新版本 Web 应用
 */

import { UserSettings, UserSettingsSchema } from '@/types/settings'
import { RSSSource, RSSSourceSchema } from '@/types/rss'
import { logger } from '@/lib/logger'

/**
 * 旧版本设置格式 (Vue 3 浏览器扩展)
 */
interface LegacySettings {
  // 基本设置
  language?: 'zh' | 'en'
  theme?: 'light' | 'dark' | 'auto'
  
  // 旋转设置
  rotationMode?: 'fixed' | 'continuous'
  rotationInterval?: number
  animationEnabled?: boolean
  
  // UI 设置
  fontSize?: 'small' | 'medium' | 'large' | 'xlarge'
  layoutMode?: 'normal' | 'compact'
  
  // 新闻源设置
  newsSources?: string[]
  activeSource?: string
  customRSSSources?: Array<{
    id?: string
    name: string
    url: string
    description?: string
    language?: 'zh' | 'en'
    enabled?: boolean
    tags?: string[]
  }>
  
  // 统计设置
  dailyGoal?: number
  notificationsEnabled?: boolean
  
  // 其他可能的字段
  [key: string]: any
}

/**
 * 迁移结果
 */
export interface MigrationResult {
  success: boolean
  settings?: Partial<UserSettings>
  rssSources?: RSSSource[]
  errors: string[]
  warnings: string[]
}

/**
 * 验证旧版本设置格式
 */
function validateLegacySettings(data: any): data is LegacySettings {
  if (!data || typeof data !== 'object') {
    return false
  }
  
  // 至少应该有一个有效的设置字段
  const validFields = [
    'language',
    'theme',
    'rotationMode',
    'rotationInterval',
    'animationEnabled',
    'fontSize',
    'layoutMode',
    'newsSources',
    'customRSSSources',
    'dailyGoal',
    'notificationsEnabled',
  ]
  
  return validFields.some((field) => field in data)
}

/**
 * 转换主题设置
 */
function convertTheme(theme?: string): 'light' | 'dark' | 'system' {
  if (theme === 'auto') return 'system'
  if (theme === 'light' || theme === 'dark') return theme
  return 'system'
}

/**
 * 转换旋转间隔
 */
function convertRotationInterval(interval?: number): number {
  if (typeof interval !== 'number') return 10
  
  // 确保在有效范围内 (5-300 秒)
  return Math.max(5, Math.min(300, interval))
}

/**
 * 转换每日目标
 */
function convertDailyGoal(goal?: number): number {
  if (typeof goal !== 'number') return 30
  
  // 确保在有效范围内 (10-100 次)
  return Math.max(10, Math.min(100, goal))
}

/**
 * 转换 RSS 源
 */
function convertRSSSources(
  sources?: Array<any>
): { rssSources: RSSSource[]; errors: string[] } {
  const rssSources: RSSSource[] = []
  const errors: string[] = []
  
  if (!Array.isArray(sources)) {
    return { rssSources, errors }
  }
  
  sources.forEach((source, index) => {
    try {
      // 验证必需字段
      if (!source.name || !source.url) {
        errors.push(`RSS 源 ${index + 1}: 缺少名称或 URL`)
        return
      }
      
      // 验证 URL 格式
      try {
        new URL(source.url)
      } catch {
        errors.push(`RSS 源 ${index + 1}: URL 格式无效`)
        return
      }
      
      // 转换为新格式
      const rssSource: RSSSource = {
        id: source.id || crypto.randomUUID(),
        name: source.name,
        url: source.url,
        description: source.description,
        language: source.language || 'zh',
        enabled: source.enabled !== false, // 默认启用
        tags: Array.isArray(source.tags) ? source.tags : [],
        order: index,
        failureCount: 0,
      }
      
      // 验证转换后的数据
      const validated = RSSSourceSchema.safeParse(rssSource)
      if (validated.success) {
        rssSources.push(validated.data)
      } else {
        errors.push(`RSS 源 ${index + 1}: 数据验证失败`)
      }
    } catch (err) {
      errors.push(`RSS 源 ${index + 1}: 转换失败`)
      logger.error('Failed to convert RSS source', err instanceof Error ? err : undefined, { source })
    }
  })
  
  return { rssSources, errors }
}

/**
 * 从旧版本设置迁移到新版本
 */
export function migrateSettings(legacyData: any): MigrationResult {
  const result: MigrationResult = {
    success: false,
    errors: [],
    warnings: [],
  }
  
  try {
    // 验证输入数据
    if (!validateLegacySettings(legacyData)) {
      result.errors.push('无效的设置格式')
      return result
    }
    
    const legacy = legacyData as LegacySettings
    
    // 转换基本设置
    const settings: Partial<UserSettings> = {
      language: legacy.language || 'zh',
      theme: convertTheme(legacy.theme),
      rotationMode: legacy.rotationMode || 'continuous',
      rotationInterval: convertRotationInterval(legacy.rotationInterval),
      animationEnabled: legacy.animationEnabled !== false,
      fontSize: legacy.fontSize || 'medium',
      layoutMode: legacy.layoutMode || 'normal',
      dailyGoal: convertDailyGoal(legacy.dailyGoal),
      notificationsEnabled: legacy.notificationsEnabled !== false,
      newsSources: Array.isArray(legacy.newsSources)
        ? legacy.newsSources
        : ['everydaynews'],
      activeSource: legacy.activeSource || 'everydaynews',
    }
    
    // 验证转换后的设置
    // 注意: 不包含 userId，因为它会在保存时添加
    const validated = UserSettingsSchema.omit({ userId: true }).safeParse(settings)
    
    if (!validated.success) {
      result.errors.push('设置数据验证失败')
      result.warnings.push('部分设置可能无法导入')
      logger.error('Settings validation failed', undefined, { validationError: validated.error.toString() })
    } else {
      result.settings = validated.data
    }
    
    // 转换 RSS 源
    if (legacy.customRSSSources) {
      const { rssSources, errors } = convertRSSSources(legacy.customRSSSources)
      result.rssSources = rssSources
      result.errors.push(...errors)
      
      if (errors.length > 0) {
        result.warnings.push(`${errors.length} 个 RSS 源导入失败`)
      }
    }
    
    // 检查是否有任何成功的转换
    result.success = !!(result.settings || (result.rssSources && result.rssSources.length > 0))
    
    if (!result.success) {
      result.errors.push('没有可导入的有效数据')
    }
    
    // 记录迁移结果
    logger.info('Migration completed', {
      success: result.success,
      settingsConverted: !!result.settings,
      rssSourcesCount: result.rssSources?.length || 0,
      errorsCount: result.errors.length,
      warningsCount: result.warnings.length,
    })
    
    return result
  } catch (err) {
    result.errors.push('迁移过程中发生错误')
    logger.error('Migration failed', err instanceof Error ? err : undefined)
    return result
  }
}

/**
 * 从 JSON 文件导入设置
 */
export async function importFromJSON(file: File): Promise<MigrationResult> {
  try {
    // 验证文件类型
    if (!file.name.endsWith('.json')) {
      return {
        success: false,
        errors: ['文件格式错误，请选择 JSON 文件'],
        warnings: [],
      }
    }
    
    // 验证文件大小 (最大 1MB)
    if (file.size > 1024 * 1024) {
      return {
        success: false,
        errors: ['文件过大，最大支持 1MB'],
        warnings: [],
      }
    }
    
    // 读取文件内容
    const text = await file.text()
    
    // 解析 JSON
    let data: any
    try {
      data = JSON.parse(text)
    } catch {
      return {
        success: false,
        errors: ['JSON 格式错误，无法解析'],
        warnings: [],
      }
    }
    
    // 执行迁移
    return migrateSettings(data)
  } catch (err) {
    logger.error('Failed to import from JSON', err instanceof Error ? err : undefined)
    return {
      success: false,
      errors: ['导入失败，请检查文件格式'],
      warnings: [],
    }
  }
}

/**
 * 导出当前设置为 JSON
 */
export function exportToJSON(
  settings: UserSettings,
  rssSources?: RSSSource[]
): string {
  const data = {
    version: '2.0',
    exportedAt: new Date().toISOString(),
    settings: {
      language: settings.language,
      theme: settings.theme,
      rotationMode: settings.rotationMode,
      rotationInterval: settings.rotationInterval,
      animationEnabled: settings.animationEnabled,
      fontSize: settings.fontSize,
      layoutMode: settings.layoutMode,
      dailyGoal: settings.dailyGoal,
      notificationsEnabled: settings.notificationsEnabled,
      newsSources: settings.newsSources,
      activeSource: settings.activeSource,
    },
    rssSources: rssSources || [],
  }
  
  return JSON.stringify(data, null, 2)
}

/**
 * 下载 JSON 文件
 */
export function downloadJSON(content: string, filename: string = 'settings.json') {
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
