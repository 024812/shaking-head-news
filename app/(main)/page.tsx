import { NewsDisplay } from '@/components/news/NewsDisplay'
import { Suspense } from 'react'

// Force dynamic rendering to avoid build-time API calls
export const dynamic = 'force-dynamic'

export default function HomePage() {
  return (
    <div className="container py-8">
      <div className="mx-auto max-w-5xl">
        <Suspense fallback={<div>Loading...</div>}>
          <NewsDisplay language="zh" />
        </Suspense>
      </div>
    </div>
  )
}
