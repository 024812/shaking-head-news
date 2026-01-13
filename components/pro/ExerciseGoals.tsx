/**
 * Exercise Goals Component
 * 运动目标组件 - Pro 功能占位
 */

'use client'

import { Target, Trophy, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useUserTier } from '@/hooks/use-user-tier'
import { LockedFeature } from '@/components/tier/LockedFeature'

interface ExerciseGoalsProps {
  className?: string
}

/**
 * 运动目标组件
 * 仅 Pro 用户可用，当前为 Coming Soon 状态
 */
export function ExerciseGoals({ className }: ExerciseGoalsProps) {
  const t = useTranslations('stats')
  const { isPro, features } = useUserTier()

  // 非 Pro 用户显示锁定状态
  if (!isPro || !features.exerciseGoalsEnabled) {
    return (
      <LockedFeature
        requiredTier="pro"
        featureName="exerciseGoalsEnabled"
        description={t('goalProgress')}
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
            <Target className="h-5 w-5" />
            {t('goal')}
          </CardTitle>
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3" />
            Coming Soon
          </Badge>
        </div>
        <CardDescription>{t('goalProgress')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <Trophy className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            运动目标功能即将推出
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            设置每日目标，追踪您的颈椎运动进度
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default ExerciseGoals
