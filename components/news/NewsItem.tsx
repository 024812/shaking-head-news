import { NewsItem as NewsItemType } from '@/types/news'

interface NewsItemProps {
  item: NewsItemType
}

export function NewsItem({ item }: NewsItemProps) {
  return (
    <div className="border-b border-border py-2 last:border-0">
      <p className="text-base leading-relaxed text-foreground">{item.title}</p>
    </div>
  )
}
