import { getHomePageNews } from '@/lib/actions/news'
import { NewsList } from './NewsList'
import { Suspense } from 'react'
import { NewsListSkeleton } from './NewsListSkeleton'
import { RefreshButton } from './RefreshButton'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { getTranslations } from 'next-intl/server'

import { auth } from '@/lib/auth'

interface NewsDisplayProps {
  language?: 'zh' | 'en'
  source?: string
}

async function NewsContent({ language = 'zh', source }: NewsDisplayProps) {
  const t = await getTranslations('news')
  const session = await auth()

  try {
    const newsResponse = await getHomePageNews(language, source)
    return <NewsList news={newsResponse.items} showLoginCTA={!session?.user} />
  } catch (error) {
    console.error('Error loading news:', error)
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{t('error')}</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : t('retryLoad')}
        </AlertDescription>
      </Alert>
    )
  }
}

export async function NewsDisplay({ language = 'zh', source }: NewsDisplayProps) {
  const t = await getTranslations('news')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t('title')}</h1>
        <RefreshButton language={language} source={source} />
      </div>

      <Suspense fallback={<NewsListSkeleton />}>
        <NewsContent language={language} source={source} />
      </Suspense>
    </div>
  )
}
