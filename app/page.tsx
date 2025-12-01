import { NewsDisplay } from '@/components/news/NewsDisplay'
import { Suspense } from 'react'

export default async function HomePage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mx-auto max-w-6xl">
        <Suspense fallback={<div className="py-8 text-center">加载中...</div>}>
          <NewsDisplay />
        </Suspense>
      </div>
    </div>
  )
}
