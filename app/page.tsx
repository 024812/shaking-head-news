import { NewsDisplay } from '@/components/news/NewsDisplay'
import { Suspense } from 'react'

export default async function HomePage() {
  return (
    <div className="container py-8">
      <div className="mx-auto max-w-6xl">
        <Suspense fallback={<div className="text-center py-8">加载中...</div>}>
          <NewsDisplay />
        </Suspense>
      </div>
    </div>
  )
}
