import { NewsItem as NewsItemType } from '@/types/news'
import { ExternalLink, Calendar } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'

interface NewsItemProps {
  item: NewsItemType
}

export function NewsItem({ item }: NewsItemProps) {
  const formattedDate = new Date(item.publishedAt).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <Card className="news-item hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-1">
            <CardTitle className="text-lg leading-tight">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors inline-flex items-center gap-2"
              >
                {item.title}
                <ExternalLink className="h-4 w-4 flex-shrink-0" />
              </a>
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <time dateTime={item.publishedAt}>{formattedDate}</time>
              {item.source && (
                <>
                  <span>•</span>
                  <span>{item.source}</span>
                </>
              )}
            </div>
          </div>
          {item.imageUrl && (
            <div className="flex-shrink-0 relative w-24 h-24">
              <Image
                src={item.imageUrl}
                alt={item.title}
                width={96}
                height={96}
                className="object-cover rounded-md"
                loading="lazy"
                sizes="96px"
                quality={75}
              />
            </div>
          )}
        </div>
      </CardHeader>
      {item.description && (
        <CardContent>
          <CardDescription className="line-clamp-3">
            {item.description}
          </CardDescription>
        </CardContent>
      )}
    </Card>
  )
}
