import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getSummaryStats } from '@/lib/actions/stats'
import { getUserSettings } from '@/lib/actions/settings'
import { StatsDisplay } from '@/components/stats/StatsDisplay'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * 统计页面加载骨架屏
 */
function StatsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/**
 * 统计页面内容
 */
async function StatsContent() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // 获取用户设置（获取每日目标）
  const settings = await getUserSettings()
  const dailyGoal = settings.dailyGoal || 30

  // 获取统计数据
  const stats = await getSummaryStats()

  return <StatsDisplay initialStats={stats} dailyGoal={dailyGoal} />
}

/**
 * 统计页面
 * 需求: 8.2 - 创建统计页面展示运动数据
 * 需求: 8.5 - 提供可视化图表
 */
export default function StatsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">统计数据</h1>
        <p className="text-muted-foreground mt-2">
          查看您的颈椎运动统计和健康趋势
        </p>
      </div>

      <Suspense fallback={<StatsLoadingSkeleton />}>
        <StatsContent />
      </Suspense>
    </div>
  )
}

/**
 * 页面元数据
 */
export const metadata = {
  title: '统计数据 - 摇头看新闻',
  description: '查看您的颈椎运动统计和健康趋势',
}
