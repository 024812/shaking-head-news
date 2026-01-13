/**
 * Default Settings Configuration
 * 默认设置配置（访客模式使用的固定值）
 */

/**
 * 默认设置常量
 * 访客模式使用这些固定值，不可修改
 */
export const DEFAULT_SETTINGS = {
  // 旋转设置 (访客模式固定值)
  rotationMode: 'continuous' as const,
  rotationInterval: 30, // 秒
  tiltAngle: 15, // 度

  // 显示设置
  fontSize: 'medium' as const,
  layoutMode: 'normal' as const,
  theme: 'system' as const,
  language: 'zh' as const,

  // 动画设置
  animationEnabled: true,

  // 广告设置
  adsEnabled: true,

  // 统计设置 (Pro 功能)
  dailyGoal: 30,
  healthRemindersEnabled: false,

  // 新闻源设置
  newsSources: ['everydaynews'] as string[],
  activeSource: 'everydaynews',
}

export type UserSettings = typeof DEFAULT_SETTINGS

/**
 * 设置值范围限制
 */
export const SETTINGS_LIMITS = {
  rotationInterval: { min: 5, max: 60 },
  tiltAngle: { min: 8, max: 25 },
  dailyGoal: { min: 10, max: 100 },
}

/**
 * 字体大小选项
 */
export const FONT_SIZE_OPTIONS = ['small', 'medium', 'large', 'xlarge'] as const
export type FontSize = (typeof FONT_SIZE_OPTIONS)[number]

/**
 * 布局模式选项
 */
export const LAYOUT_MODE_OPTIONS = ['normal', 'compact'] as const
export type LayoutMode = (typeof LAYOUT_MODE_OPTIONS)[number]

/**
 * 旋转模式选项
 */
export const ROTATION_MODE_OPTIONS = ['fixed', 'continuous'] as const
export type RotationMode = (typeof ROTATION_MODE_OPTIONS)[number]

/**
 * 主题选项
 */
export const THEME_OPTIONS = ['light', 'dark', 'system'] as const
export type Theme = (typeof THEME_OPTIONS)[number]

/**
 * 语言选项
 */
export const LANGUAGE_OPTIONS = ['zh', 'en'] as const
export type Language = (typeof LANGUAGE_OPTIONS)[number]

/**
 * 验证设置值是否在有效范围内
 */
export function validateSettingValue<K extends keyof typeof SETTINGS_LIMITS>(
  key: K,
  value: number
): boolean {
  const limits = SETTINGS_LIMITS[key]
  return value >= limits.min && value <= limits.max
}

/**
 * 将设置值限制在有效范围内
 */
export function clampSettingValue<K extends keyof typeof SETTINGS_LIMITS>(
  key: K,
  value: number
): number {
  const limits = SETTINGS_LIMITS[key]
  return Math.max(limits.min, Math.min(limits.max, value))
}
