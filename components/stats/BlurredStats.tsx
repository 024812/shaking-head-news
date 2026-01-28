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
import { Lock, TrendingUp, Calendar, Target, Loader2 } from 'lucide-react'
import { useUserTier } from '@/hooks/use-user-tier'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface BlurredStatsProps {
  className?: string
  /** 服务端传入的用户层级 */
  tier?: 'guest' | 'member' | 'pro'
}

/**
 * 模糊统计组件
 */
export function BlurredStats({ className, tier: serverTier }: BlurredStatsProps) {
  const { isGuest: clientIsGuest, isMember: clientIsMember } = useUserTier()

  // 优先使用服务端传入的 tier
  const isGuest = serverTier ? serverTier === 'guest' : clientIsGuest
  const isMember = serverTier ? serverTier === 'member' : clientIsMember

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
      <div className="pointer-events-none opacity-50 blur-md select-none">
        <StatsPlaceholder />
      </div>

      {/* 登录提示遮罩 */}
      <div className="bg-background/80 absolute inset-0 flex items-center justify-center backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-full">
            <Lock className="text-muted-foreground h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">查看统计数据</h3>
            <p className="text-muted-foreground max-w-xs text-sm">
              {tTier('loginToUnlockDescription')}
            </p>
          </div>
          <Button onClick={() => signIn()}>{tTier('loginButton')}</Button>
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
  const { togglePro, isTogglingPro } = useUserTier()

  return (
    <div className="space-y-6">
      {/* 基础统计卡片（可见） */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('today')}</CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-muted-foreground text-xs">{t('rotationCount')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('week')}</CardTitle>
            <Calendar className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-muted-foreground text-xs">{t('average')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('goal')}</CardTitle>
            <Target className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-muted-foreground text-xs">{t('goalProgress')}</p>
          </CardContent>
        </Card>
      </div>

      {/* 详细图表（模糊 + 升级提示） */}
      <div className="relative">
        <div className="pointer-events-none opacity-50 blur-md select-none">
          <Card>
            <CardHeader>
              <CardTitle>{t('weeklyTrend')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 flex h-[200px] items-center justify-center rounded">
                <div className="text-muted-foreground">图表预览</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 升级提示遮罩 */}
        <div className="bg-background/60 absolute inset-0 flex items-center justify-center rounded-lg backdrop-blur-[2px]">
          <div className="flex flex-col items-center gap-3 p-4 text-center">
            <Lock className="text-muted-foreground h-6 w-6" />
            <div className="space-y-1">
              <p className="font-medium">完整统计数据</p>
              <p className="text-muted-foreground text-sm">升级到 Pro 查看详细图表和历史数据</p>
            </div>
            <Button variant="outline" size="sm" onClick={togglePro} disabled={isTogglingPro}>
              {isTogglingPro && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
              <div className="bg-muted h-4 w-20 rounded" />
            </CardHeader>
            <CardContent>
              <div className="bg-muted mb-2 h-8 w-16 rounded" />
              <div className="bg-muted h-3 w-24 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="bg-muted h-5 w-32 rounded" />
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 h-[200px] rounded" />
        </CardContent>
      </Card>
    </div>
  )
}

export default BlurredStats
