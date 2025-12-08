import { NewsItem as NewsItemType } from '@/types/news'
import { NewsItem } from './NewsItem'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface NewsListProps {
  news: NewsItemType[]
}

export function NewsList({ news }: NewsListProps) {
  if (!news || news.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>暂无新闻</AlertTitle>
        <AlertDescription>当前没有可显示的新闻内容，请稍后再试或刷新页面。</AlertDescription>
      </Alert>
    )
  }

  return (
    <div
      className="scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent max-h-[600px] divide-y divide-border overflow-y-auto pr-2"
      data-testid="news-list"
    >
      {news.map((item) => (
        <NewsItem key={item.id} item={item} />
      ))}
    </div>
  )
}
