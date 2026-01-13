/**
 * BlurredStats Component
 * 模糊统计组件
 *
 * 根据用户层级显示不同内容：
 * - Guest: 显示 "登录查看统计" 提示
 * - Member: 显示模糊预览 + "升级到 Pro 查看完整数据"
 * - Pro: 不使用此组件，直接显示完整统计
 */

'use client'

import { useTranslations } from 'next-intl'
import { signIn } from 'next-auth/react'
import { Lock, TrendingUp, Calendar, Target } from 'lucide-react'
import { useUserTier } from '@/hooks/use-user-tier'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface BlurredStatsProps {
  className?: string
}

/**
 * 模糊统计组件
 */
export function BlurredStats({ className }: BlurredStatsProps) {
  const { isGuest, isMember } = useUserTier()

  // Guest 用户显示登录提示
  if (isGuest) {
    return (
      <div className={cn('space-y-6', className)}>
        <GuestStatsOverlay />
      </div>
    )
  }

  // Member 用户显示模糊预览
  if (isMember) {
    return (
      <div className={cn('space-y-6', className)}>
        <MemberStatsPreview />
      </div>
    )
  }

  // Pro 用户不应该使用此组件
  return null
}

/**
 * Guest 用户统计遮罩
 */
function GuestStatsOverlay() {
  const tTier = useTranslations('tier')

  return (
    <div className="relative">
      {/* 模糊背景 */}
      <div className="pointer-events-none select-none blur-md opacity-50">
        <StatsPlaceholder />
      </div>

      {/* 登录提示遮罩 */}
      <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">查看统计数据</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              {tTier('loginToUnlockDescription')}
            </p>
          </div>
          <Button onClick={() => signIn()}>
            {tTier('loginButton')}
          </Button>
        </div>
      </div>
    </div>
  )
}

/**
 * Member 用户统计预览
 */
function MemberStatsPreview() {
  const t = useTranslations('stats')
  const tTier = useTranslations('tier')

  return (
    <div className="space-y-6">
      {/* 基础统计卡片（可见） */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('today')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">{t('rotationCount')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('week')}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">{t('average')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('goal')}</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">{t('goalProgress')}</p>
          </CardContent>
        </Card>
      </div>

      {/* 详细图表（模糊 + 升级提示） */}
      <div className="relative">
        <div className="pointer-events-none select-none blur-md opacity-50">
          <Card>
            <CardHeader>
              <CardTitle>{t('weeklyTrend')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center bg-muted/30 rounded">
                <div className="text-muted-foreground">图表预览</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 升级提示遮罩 */}
        <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-lg">
          <div className="flex flex-col items-center gap-3 text-center p-4">
            <Lock className="h-6 w-6 text-muted-foreground" />
            <div className="space-y-1">
              <p className="font-medium">完整统计数据</p>
              <p className="text-sm text-muted-foreground">
                升级到 Pro 查看详细图表和历史数据
              </p>
            </div>
            <Button variant="outline" size="sm">
              {tTier('upgradeButton')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 统计占位符（用于模糊背景）
 */
function StatsPlaceholder() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 w-20 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted rounded mb-2" />
              <div className="h-3 w-24 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="h-5 w-32 bg-muted rounded" />
        </CardHeader>
        <CardContent>
          <div className="h-[200px] bg-muted/30 rounded" />
        </CardContent>
      </Card>
    </div>
  )
}

export default BlurredStats
