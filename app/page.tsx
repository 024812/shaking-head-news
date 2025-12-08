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

export default async function HomePage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mx-auto max-w-6xl">
        <Suspense fallback={<HomePageSkeleton />}>
          <NewsDisplay />
        </Suspense>
      </div>
    </div>
  )
}
