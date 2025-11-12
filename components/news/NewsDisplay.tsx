import { getNews } from '@/lib/actions/news'
import { NewsList } from './NewsList'
import { Suspense } from 'react'
import { NewsListSkeleton } from './NewsListSkeleton'
import { RefreshButton } from './RefreshButton'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface NewsDisplayProps {
  language?: 'zh' | 'en'
  source?: string
}

async function NewsContent({ language = 'zh', source }: NewsDisplayProps) {
  try {
    const newsResponse = await getNews(language, source)
    return <NewsList news={newsResponse.items} />
  } catch (error) {
    console.error('Error loading news:', error)
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>加载失败</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : '无法加载新闻内容，请稍后重试。'}
        </AlertDescription>
      </Alert>
    )
  }
}

export async function NewsDisplay({ language = 'zh', source }: NewsDisplayProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">今日新闻</h1>
          <p className="text-muted-foreground mt-1">
            获取最新资讯，保持颈椎健康
          </p>
        </div>
        <RefreshButton language={language} source={source} />
      </div>

      <Suspense fallback={<NewsListSkeleton />}>
        <NewsContent language={language} source={source} />
      </Suspense>
    </div>
  )
}
