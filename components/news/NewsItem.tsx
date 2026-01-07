import { NewsItem as NewsItemType } from '@/types/news'
import { cn } from '@/lib/utils'

interface NewsItemProps {
  item: NewsItemType
}

export function NewsItem({ item }: NewsItemProps) {
  return (
    <div className="border-border border-b py-2 last:border-0">
      <p className="text-foreground text-base leading-relaxed">{item.title}</p>
    </div>
  )
}
