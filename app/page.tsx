import { RotationControls } from '@/components/rotation/RotationControls'
import { NewsDisplay } from '@/components/news/NewsDisplay'
import { Suspense } from 'react'

export default async function HomePage() {

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Rotation Controls */}
        <div className="flex justify-center">
          <RotationControls />
        </div>

        {/* News Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">今日新闻</h2>
          </div>
          <Suspense fallback={<div className="text-center py-8">加载中...</div>}>
            <NewsDisplay />
          </Suspense>
        </div>


      </div>
    </div>
  )
}
