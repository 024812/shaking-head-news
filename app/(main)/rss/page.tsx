import { Suspense } from 'react'
import { getRSSSources } from '@/lib/actions/rss'
import { RSSSourceList } from '@/components/rss/RSSSourceList'
import { AddRSSSourceDialog } from '@/components/rss/AddRSSSourceDialog'
import { ExportOPMLButton } from '@/components/rss/ExportOPMLButton'
import { Card, CardContent } from '@/components/ui/card'

import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

async function RSSContent() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const sources = await getRSSSources()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">RSS 源管理</h2>
          <p className="text-muted-foreground">管理您的 RSS 订阅源，自定义新闻来源</p>
        </div>
        <div className="flex gap-2">
          <ExportOPMLButton />
          <AddRSSSourceDialog />
        </div>
      </div>

      <RSSSourceList initialSources={sources} />
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="bg-muted h-8 w-48 animate-pulse rounded" />
          <div className="bg-muted h-4 w-64 animate-pulse rounded" />
        </div>
        <div className="flex gap-2">
          <div className="bg-muted h-10 w-32 animate-pulse rounded" />
          <div className="bg-muted h-10 w-32 animate-pulse rounded" />
        </div>
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="bg-muted h-6 w-3/4 animate-pulse rounded" />
                <div className="bg-muted h-4 w-full animate-pulse rounded" />
                <div className="flex gap-2">
                  <div className="bg-muted h-6 w-16 animate-pulse rounded" />
                  <div className="bg-muted h-6 w-16 animate-pulse rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function RSSPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<LoadingSkeleton />}>
        <RSSContent />
      </Suspense>
    </div>
  )
}

export const metadata = {
  title: 'RSS 源管理 - 摇头看新闻',
  description: '管理您的 RSS 订阅源，自定义新闻来源',
}
