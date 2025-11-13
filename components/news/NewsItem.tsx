import { NewsItem as NewsItemType } from '@/types/news'

interface NewsItemProps {
  item: NewsItemType
}

export function NewsItem({ item }: NewsItemProps) {
  return (
    <div className="py-2 border-b border-border last:border-0">
      <p className="text-sm leading-relaxed text-foreground">
        {item.title}
      </p>
    </div>
  )
}
