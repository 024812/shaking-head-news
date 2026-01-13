import { NewsItem as NewsItemType } from '@/types/news'
import { ExternalLink } from 'lucide-react'

interface NewsItemProps {
  item: NewsItemType
}

export function NewsItem({ item }: NewsItemProps) {
  const hasUrl = item.url && item.url.trim() !== ''

  if (hasUrl) {
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group border-border hover:bg-muted/50 flex cursor-pointer items-start gap-2 border-b py-3 transition-colors duration-200 last:border-0"
      >
        <p className="text-foreground group-hover:text-primary flex-1 text-base leading-relaxed transition-colors duration-200">
          {item.title}
        </p>
        <ExternalLink className="text-muted-foreground mt-1 h-4 w-4 shrink-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      </a>
    )
  }

  return (
    <div className="border-border hover:bg-muted/50 border-b py-3 transition-colors duration-200 last:border-0">
      <p className="text-foreground text-base leading-relaxed">{item.title}</p>
    </div>
  )
}
