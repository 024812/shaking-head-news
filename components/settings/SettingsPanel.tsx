'use client'

import { useState, useTransition, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { updateSettings, resetSettings } from '@/lib/actions/settings'
import { useToast } from '@/hooks/use-toast'
import { UserSettings } from '@/types/settings'
import { Loader2, RotateCcw, Lock } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { LanguageSelector } from './LanguageSelector'
import { useUIStore } from '@/lib/stores/ui-store'
import { useRotationStore } from '@/lib/stores/rotation-store'
import { useTheme } from 'next-themes'
import { useUserTier } from '@/hooks/use-user-tier'
import { UpgradePrompt } from '@/components/tier/UpgradePrompt'
import { DEFAULT_SETTINGS } from '@/lib/config/defaults'

interface SettingsPanelProps {
  initialSettings: UserSettings
}

/**
 * 锁定设置项组件
 */
function LockedSettingItem({
  label,
  description,
  value,
  requiredTier = 'member',
}: {
  label: string
  description?: string
  value: string
  requiredTier?: 'member' | 'pro'
}) {
  const t = useTranslations('tier')

  return (
    <div className="space-y-2 opacity-60">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          {label}
          <Lock className="h-3 w-3 text-muted-foreground" />
        </Label>
        <span className="text-sm text-muted-foreground">{value}</span>
      </div>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      <p className="text-xs text-muted-foreground">
        {requiredTier === 'member' ? t('loginToUnlock') : t('upgradeToUnlock')}
      </p>
    </div>
  )
}

export function SettingsPanel({ initialSettings }: SettingsPanelProps) {
  const [settings, setSettings] = useState<UserSettings>(initialSettings)
  const [isPending, startTransition] = useTransition()
  const [isResetting, startResetTransition] = useTransition()
  const { toast } = useToast()
  const t = useTranslations('settings')
  const tTier = useTranslations('tier')
  const { setFontSize, setLayoutMode } = useUIStore()
  const { setMode: setRotationMode, setInterval: setRotationInterval } = useRotationStore()
  const { setTheme } = useTheme()
  const { isGuest, isMember, features } = useUserTier()

  // Sync UI store, rotation store, and theme with settings on mount and when settings change
  useEffect(() => {
    setFontSize(settings.fontSize)
    setLayoutMode(settings.layoutMode)
    setTheme(settings.theme)
    setRotationMode(settings.rotationMode)
    setRotationInterval(settings.rotationInterval)
  }, [
    settings.fontSize,
    settings.layoutMode,
    settings.theme,
    settings.rotationMode,
    settings.rotationInterval,
    setFontSize,
    setLayoutMode,
    setTheme,
    setRotationMode,
    setRotationInterval,
  ])

  const handleSave = () => {
    startTransition(async () => {
      try {
        const result = await updateSettings(settings)

        if (result.success) {
          toast({
            title: t('saveSuccess'),
            description: t('saveSuccessDescription'),
          })
        } else {
          toast({
            title: t('saveError'),
            description: result.error || t('saveErrorDescription'),
            variant: 'destructive',
          })
        }
      } catch {
        toast({
          title: t('saveError'),
          description: t('saveErrorDescription'),
          variant: 'destructive',
        })
      }
    })
  }

  const handleReset = () => {
    startResetTransition(async () => {
      try {
        const result = await resetSettings()

        if (result.success && result.settings) {
          setSettings(result.settings)
          toast({
            title: t('saveSuccess'),
            description: t('saveSuccessDescription'),
          })
        } else {
          toast({
            title: t('saveError'),
            description: result.error || t('saveErrorDescription'),
            variant: 'destructive',
          })
        }
      } catch {
        toast({
          title: t('saveError'),
          description: t('saveErrorDescription'),
          variant: 'destructive',
        })
      }
    })
  }

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))

    // Update UI store, rotation store, and theme immediately for instant visual feedback
    if (key === 'fontSize') {
      setFontSize(value as UserSettings['fontSize'])
    } else if (key === 'layoutMode') {
      setLayoutMode(value as UserSettings['layoutMode'])
    } else if (key === 'theme') {
      setTheme(value as string)
    } else if (key === 'rotationMode') {
      setRotationMode(value as 'fixed' | 'continuous')
    } else if (key === 'rotationInterval') {
      setRotationInterval(value as number)
    }
  }

  return (
    <div className="space-y-6">
      {/* 语言和主题设置 */}
      <Card>
        <CardHeader>
          <CardTitle>{t('theme')}</CardTitle>
          <CardDescription>{t('themeDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <LanguageSelector currentLanguage={settings.language} />

          <div className="space-y-2">
            <Label htmlFor="theme">{t('theme')}</Label>
            <Select
              value={settings.theme}
              onValueChange={(value) =>
                updateSetting('theme', value as 'light' | 'dark' | 'system')
              }
            >
              <SelectTrigger id="theme">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">{t('light')}</SelectItem>
                <SelectItem value="dark">{t('dark')}</SelectItem>
                <SelectItem value="system">{t('system')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 字体大小 - Guest 锁定 */}
          {features.fontSizeAdjustable ? (
            <div className="space-y-2">
              <Label htmlFor="fontSize">{t('fontSize')}</Label>
              <Select
                value={settings.fontSize}
                onValueChange={(value) =>
                  updateSetting('fontSize', value as UserSettings['fontSize'])
                }
              >
                <SelectTrigger id="fontSize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">{t('small')}</SelectItem>
                  <SelectItem value="medium">{t('medium')}</SelectItem>
                  <SelectItem value="large">{t('large')}</SelectItem>
                  <SelectItem value="xlarge">{t('xlarge')}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-muted-foreground text-sm">{t('fontSizeDescription')}</p>
            </div>
          ) : (
            <LockedSettingItem
              label={t('fontSize')}
              description={t('fontSizeDescription')}
              value={t('medium')}
              requiredTier="member"
            />
          )}

          {/* 布局模式 - Guest 锁定 */}
          {features.layoutModeSelectable ? (
            <div className="space-y-2">
              <Label htmlFor="layoutMode">{t('layout')}</Label>
              <Select
                value={settings.layoutMode}
                onValueChange={(value) => updateSetting('layoutMode', value as 'normal' | 'compact')}
              >
                <SelectTrigger id="layoutMode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">{t('normal')}</SelectItem>
                  <SelectItem value="compact">{t('compact')}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-muted-foreground text-sm">{t('layoutDescription')}</p>
            </div>
          ) : (
            <LockedSettingItem
              label={t('layout')}
              description={t('layoutDescription')}
              value={t('normal')}
              requiredTier="member"
            />
          )}
        </CardContent>
      </Card>

      {/* 新闻源设置 */}
      <Card>
        <CardHeader>
          <CardTitle>{t('newsSource') || '新闻源'}</CardTitle>
          <CardDescription>
            {t('newsSourceDescription') || '管理您的新闻来源和 RSS 订阅'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {features.customRssEnabled ? (
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>RSS 订阅管理</Label>
                <p className="text-muted-foreground text-sm">添加或移除自定义 RSS 新闻源</p>
              </div>
              <Button variant="outline" asChild>
                <a href="/rss">管理订阅</a>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between opacity-60">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    RSS 订阅管理
                    <Lock className="h-3 w-3 text-muted-foreground" />
                  </Label>
                  <p className="text-muted-foreground text-sm">添加或移除自定义 RSS 新闻源</p>
                </div>
                <Button variant="outline" disabled>
                  管理订阅
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">{tTier('loginToUnlock')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 旋转设置 */}
      <Card>
        <CardHeader>
          <CardTitle>{t('rotation')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 旋转模式 - Guest 锁定 */}
          {features.rotationModeSelectable ? (
            <div className="space-y-2">
              <Label htmlFor="rotationMode">{t('rotationMode')}</Label>
              <Select
                value={settings.rotationMode}
                onValueChange={(value) =>
                  updateSetting('rotationMode', value as 'fixed' | 'continuous')
                }
              >
                <SelectTrigger id="rotationMode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">{t('fixed')}</SelectItem>
                  <SelectItem value="continuous">{t('continuous')}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-muted-foreground text-sm">{t('rotationModeDescription')}</p>
            </div>
          ) : (
            <LockedSettingItem
              label={t('rotationMode')}
              description={t('rotationModeDescription')}
              value={t('continuous')}
              requiredTier="member"
            />
          )}

          {/* 旋转间隔 - Guest 锁定 */}
          {features.rotationIntervalAdjustable ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="rotationInterval">{t('interval')}</Label>
                <span className="text-muted-foreground text-sm">{settings.rotationInterval}s</span>
              </div>
              <Slider
                id="rotationInterval"
                value={[settings.rotationInterval]}
                onValueChange={([value]) => updateSetting('rotationInterval', value)}
                min={5}
                max={60}
                step={5}
                className="w-full"
              />
              <p className="text-muted-foreground text-sm">{t('intervalDescription')}</p>
            </div>
          ) : (
            <LockedSettingItem
              label={t('interval')}
              description={t('intervalDescription')}
              value={`${DEFAULT_SETTINGS.rotationInterval}s`}
              requiredTier="member"
            />
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="animationEnabled">{t('animation')}</Label>
              <p className="text-muted-foreground text-sm">{t('animationDescription')}</p>
            </div>
            <Switch
              id="animationEnabled"
              checked={settings.animationEnabled}
              onCheckedChange={(checked) => updateSetting('animationEnabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* 广告设置 - Pro 功能 */}
      <Card>
        <CardHeader>
          <CardTitle>广告设置</CardTitle>
          <CardDescription>管理广告显示偏好</CardDescription>
        </CardHeader>
        <CardContent>
          {features.adsDisableable ? (
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="adsEnabled">显示广告</Label>
                <p className="text-muted-foreground text-sm">
                  关闭后将不再显示广告
                </p>
              </div>
              <Switch
                id="adsEnabled"
                checked={true} // TODO: 从设置中读取
                onCheckedChange={(checked) => {
                  // TODO: 保存广告偏好
                  localStorage.setItem('adsEnabled', String(checked))
                }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-between opacity-60">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  关闭广告
                  <Lock className="h-3 w-3 text-muted-foreground" />
                </Label>
                <p className="text-muted-foreground text-sm">
                  {isMember
                    ? '升级到 Pro 可关闭广告'
                    : '登录后升级到 Pro 可关闭广告'}
                </p>
              </div>
              <Switch disabled checked={true} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* 健康提醒设置 - Pro 功能 */}
      <Card>
        <CardHeader>
          <CardTitle>{t('notifications')}</CardTitle>
          <CardDescription>{t('dailyGoalDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 每日目标 - Pro 功能 */}
          {features.exerciseGoalsEnabled ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="dailyGoal">{t('dailyGoal')}</Label>
                <span className="text-muted-foreground text-sm">{settings.dailyGoal}</span>
              </div>
              <Slider
                id="dailyGoal"
                value={[settings.dailyGoal]}
                onValueChange={([value]) => updateSetting('dailyGoal', value)}
                min={10}
                max={100}
                step={5}
                className="w-full"
              />
              <p className="text-muted-foreground text-sm">{t('dailyGoalDescription')}</p>
            </div>
          ) : (
            <LockedSettingItem
              label={t('dailyGoal')}
              description={t('dailyGoalDescription')}
              value="30"
              requiredTier="pro"
            />
          )}

          {/* 健康提醒 - Pro 功能 */}
          {features.healthRemindersEnabled ? (
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notificationsEnabled">{t('notifications')}</Label>
                <p className="text-muted-foreground text-sm">{t('notificationsDescription')}</p>
              </div>
              <Switch
                id="notificationsEnabled"
                checked={settings.notificationsEnabled}
                onCheckedChange={(checked) => updateSetting('notificationsEnabled', checked)}
              />
            </div>
          ) : (
            <div className="flex items-center justify-between opacity-60">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  {t('notifications')}
                  <Lock className="h-3 w-3 text-muted-foreground" />
                </Label>
                <p className="text-muted-foreground text-sm">{t('notificationsDescription')}</p>
                <p className="text-xs text-muted-foreground">{tTier('upgradeToUnlock')}</p>
              </div>
              <Switch disabled checked={false} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Guest 用户升级提示 */}
      {isGuest && (
        <UpgradePrompt variant="inline" className="my-4" />
      )}

      {/* 操作按钮 - 仅登录用户可保存 */}
      {!isGuest ? (
        <div className="flex gap-4">
          <Button onClick={handleSave} disabled={isPending || isResetting} className="flex-1">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            保存
          </Button>
          <Button onClick={handleReset} disabled={isPending || isResetting} variant="outline">
            {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!isResetting && <RotateCcw className="mr-2 h-4 w-4" />}
            重置
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-4 text-center">
          <p className="text-sm text-muted-foreground">
            {tTier('loginToUnlockDescription')}
          </p>
        </div>
      )}
    </div>
  )
}
