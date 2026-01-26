import { NewsDisplay } from '@/components/news/NewsDisplay'
import { NewsListSkeleton } from '@/components/news/NewsListSkeleton'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export const revalidate = 3600 // ISR: 每小时重新验证一次

function HomePageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-9 w-16" />
      </div>
      <NewsListSkeleton />
    </div>
  )
}

import { AdBanner } from '@/components/ads/AdBanner'
import { auth } from '@/lib/auth'
import { getUserSettings } from '@/lib/actions/settings'

export default async function HomePage() {
  const session = await auth()
  const settings = session?.user ? await getUserSettings() : null
  const isPro = settings?.isPro ?? false

  return (
    <div className="container mx-auto py-8">
      {/* 3-column layout: Sidebar (Left) - Main Content - Sidebar (Right) */}
      {/* 3-column layout: Sidebar (Left) - Main Content - Sidebar (Right) */}
      <div className="grid grid-cols-1 gap-24 xl:grid-cols-[200px_1fr_200px]">
        {/* Left Sidebar Ad - Vertically Centered */}
        <aside className="sticky top-0 hidden h-screen flex-col justify-center xl:flex">
          <AdBanner
            position="sidebar"
            size="large"
            className="min-h-[600px] w-full"
            initialIsPro={isPro}
          />
        </aside>

        {/* Main Content */}
        <div className="mx-auto w-full max-w-6xl">
          <Suspense fallback={<HomePageSkeleton />}>
            <NewsDisplay />
          </Suspense>
        </div>

        {/* Right Sidebar Ad - Vertically Centered */}
        <aside className="sticky top-0 hidden h-screen flex-col justify-center xl:flex">
          <AdBanner
            position="sidebar"
            size="large"
            className="min-h-[600px] w-full"
            initialIsPro={isPro}
          />
        </aside>
      </div>
    </div>
  )
}
