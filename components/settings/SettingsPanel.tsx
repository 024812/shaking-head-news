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
import { Loader2, RotateCcw } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { LanguageSelector } from './LanguageSelector'
import { useUIStore } from '@/lib/stores/ui-store'
import { useTheme } from 'next-themes'

interface SettingsPanelProps {
  initialSettings: UserSettings
}

export function SettingsPanel({ initialSettings }: SettingsPanelProps) {
  const [settings, setSettings] = useState<UserSettings>(initialSettings)
  const [isPending, startTransition] = useTransition()
  const [isResetting, startResetTransition] = useTransition()
  const { toast } = useToast()
  const t = useTranslations('settings')
  const { setFontSize, setLayoutMode } = useUIStore()
  const { setTheme } = useTheme()

  // Sync UI store and theme with settings on mount and when settings change
  useEffect(() => {
    setFontSize(settings.fontSize)
    setLayoutMode(settings.layoutMode)
    setTheme(settings.theme)
  }, [settings.fontSize, settings.layoutMode, settings.theme, setFontSize, setLayoutMode, setTheme])

  const handleSave = () => {
    console.log('[Settings] Save button clicked, current settings:', settings)
    startTransition(async () => {
      try {
        console.log('[Settings] Calling updateSettings...')
        const result = await updateSettings(settings)
        console.log('[Settings] updateSettings result:', result)

        if (result.success) {
          console.log('[Settings] Save successful!')
          toast({
            title: t('saveSuccess'),
            description: t('saveSuccessDescription'),
          })
        } else {
          console.error('[Settings] Save failed:', result.error)
          toast({
            title: t('saveError'),
            description: result.error || t('saveErrorDescription'),
            variant: 'destructive',
          })
        }
      } catch (error) {
        console.error('[Settings] Save error:', error)
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

    // Update UI store and theme immediately for instant visual feedback
    if (key === 'fontSize') {
      setFontSize(value as UserSettings['fontSize'])
    } else if (key === 'layoutMode') {
      setLayoutMode(value as UserSettings['layoutMode'])
    } else if (key === 'theme') {
      setTheme(value as string)
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
            <p className="text-sm text-muted-foreground">{t('fontSizeDescription')}</p>
          </div>

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
            <p className="text-sm text-muted-foreground">{t('layoutDescription')}</p>
          </div>
        </CardContent>
      </Card>

      {/* 旋转设置 */}
      <Card>
        <CardHeader>
          <CardTitle>{t('rotation')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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
            <p className="text-sm text-muted-foreground">{t('rotationModeDescription')}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="rotationInterval">{t('interval')}</Label>
              <span className="text-sm text-muted-foreground">{settings.rotationInterval}s</span>
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
            <p className="text-sm text-muted-foreground">{t('intervalDescription')}</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="animationEnabled">{t('animation')}</Label>
              <p className="text-sm text-muted-foreground">{t('animationDescription')}</p>
            </div>
            <Switch
              id="animationEnabled"
              checked={settings.animationEnabled}
              onCheckedChange={(checked) => updateSetting('animationEnabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* 健康提醒设置 */}
      <Card>
        <CardHeader>
          <CardTitle>{t('notifications')}</CardTitle>
          <CardDescription>{t('dailyGoalDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="dailyGoal">{t('dailyGoal')}</Label>
              <span className="text-sm text-muted-foreground">{settings.dailyGoal}</span>
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
            <p className="text-sm text-muted-foreground">{t('dailyGoalDescription')}</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notificationsEnabled">{t('notifications')}</Label>
              <p className="text-sm text-muted-foreground">{t('notificationsDescription')}</p>
            </div>
            <Switch
              id="notificationsEnabled"
              checked={settings.notificationsEnabled}
              onCheckedChange={(checked) => updateSetting('notificationsEnabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* 操作按钮 */}
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
    </div>
  )
}
