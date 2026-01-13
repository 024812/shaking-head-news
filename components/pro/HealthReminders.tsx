/**
 * Health Reminders Component
 * 健康提醒组件 - Pro 功能占位
 */

'use client'

import { Bell, Clock, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useUserTier } from '@/hooks/use-user-tier'
import { LockedFeature } from '@/components/tier/LockedFeature'

interface HealthRemindersProps {
  className?: string
}

/**
 * 健康提醒组件
 * 仅 Pro 用户可用，当前为 Coming Soon 状态
 */
export function HealthReminders({ className }: HealthRemindersProps) {
  const t = useTranslations('stats')
  const { isPro, features } = useUserTier()

  // 非 Pro 用户显示锁定状态
  if (!isPro || !features.healthRemindersEnabled) {
    return (
      <LockedFeature
        requiredTier="pro"
        featureName="healthRemindersEnabled"
        description={t('healthReminderDescription')}
        className={className}
      />
    )
  }

  // Pro 用户显示 Coming Soon
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {t('healthReminder')}
          </CardTitle>
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3" />
            Coming Soon
          </Badge>
        </div>
        <CardDescription>{t('healthReminderDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <Clock className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            健康提醒功能即将推出
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            设置定时提醒，帮助您养成健康习惯
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default HealthReminders
