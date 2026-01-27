import { Suspense } from 'react'
import { NewsDisplay } from '@/components/news/NewsDisplay'
import { NewsListSkeleton } from '@/components/news/NewsListSkeleton'
import { getTranslations } from 'next-intl/server'
import { getAiNewsItems, getTrendingNewsItems, getHomePageNews } from '@/lib/actions/news'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { NewsList } from '@/components/news/NewsList'
import { AdBanner } from '@/components/ads/AdBanner'
import { auth } from '@/lib/auth'
import { getUserSettings } from '@/lib/actions/settings'
import { Skeleton } from '@/components/ui/skeleton'

export const revalidate = 3600 // ISR: 每小时重新验证一次

function HomePageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-9 w-16" />
      </div>
      <NewsListSkeleton />
    </div>
  )
}

export default async function HomePage() {
  const t = await getTranslations('home')
  const session = await auth()
  const settings = session?.user ? await getUserSettings() : null
  const isPro = settings?.isPro ?? false
  const isMember = !!session?.user

  // Fetch data
  // For guests: Daily + AI merged
  // For members: Daily, AI, Trending separated
  const [dailyResponse, aiNews, trendingNews] = await Promise.all([
    getHomePageNews('zh').catch(() => ({ items: [], total: 0 })), // Fetch explicitly for merging
    getAiNewsItems().catch(() => []),
    getTrendingNewsItems('douyin').catch(() => []),
  ])

  // Guest View: Merge Daily and AI, no tabs, no trending
  if (!isMember) {
    const mergedNews = [...dailyResponse.items, ...aiNews]

    return (
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[200px_1fr_200px] xl:gap-24">
          {/* Left Sidebar Ad */}
          <aside className="sticky top-0 hidden h-screen flex-col justify-center xl:flex">
            {/* Ad component remains same */}
            <AdBanner
              position="sidebar"
              size="large"
              className="min-h-[600px] w-full"
              initialIsPro={false}
            />
          </aside>

          <main className="mx-auto w-full max-w-4xl">
            <div className="mb-6">
              <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
              <p className="text-muted-foreground mt-2">{t('subtitle')}</p>
            </div>

            <div className="space-y-6">
              <NewsList news={mergedNews} showLoginCTA={true} />
            </div>
          </main>

          {/* Right Sidebar Ad */}
          <aside className="sticky top-0 hidden h-screen flex-col justify-center xl:flex">
            <AdBanner
              position="sidebar"
              size="large"
              className="min-h-[600px] w-full"
              initialIsPro={false}
            />
          </aside>
        </div>
      </div>
    )
  }

  // Member View: Tabs
  return (
    <div className="container mx-auto py-8">
      {/* 3-column layout: Sidebar (Left) - Main Content - Sidebar (Right) */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[200px_1fr_200px] xl:gap-24">
        {/* Left Sidebar Ad - Vertically Centered */}
        <aside className="sticky top-0 hidden h-screen flex-col justify-center xl:flex">
          <AdBanner
            position="sidebar"
            size="large"
            className="min-h-[600px] w-full"
            initialIsPro={isPro}
          />
        </aside>

        {/* Main Content */}
        <main className="mx-auto w-full max-w-4xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-muted-foreground mt-2">{t('subtitle')}</p>
          </div>

          <Tabs defaultValue="daily" className="w-full">
            <TabsList className="mb-6 w-full justify-start sm:w-auto">
              <TabsTrigger value="daily">Daily Brief</TabsTrigger>
              <TabsTrigger value="ai">AI News</TabsTrigger>
              <TabsTrigger value="trending">Trending</TabsTrigger>
            </TabsList>

            <TabsContent value="daily" className="min-h-[500px] space-y-4">
              <Suspense fallback={<HomePageSkeleton />}>
                <NewsDisplay />
              </Suspense>
            </TabsContent>

            <TabsContent value="ai" className="min-h-[500px] space-y-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">Artificial Intelligence</h2>
              </div>
              <NewsList news={aiNews} showLoginCTA={!session?.user} />
            </TabsContent>

            <TabsContent value="trending" className="min-h-[500px] space-y-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">Trending Now (Douyin)</h2>
              </div>
              <NewsList news={trendingNews} showLoginCTA={!session?.user} />
            </TabsContent>
          </Tabs>
        </main>

        {/* Right Sidebar Ad - Vertically Centered */}
        <aside className="sticky top-0 hidden h-screen flex-col justify-center xl:flex">
          <AdBanner
            position="sidebar"
            size="large"
            className="min-h-[600px] w-full"
            initialIsPro={isPro}
          />
        </aside>
      </div>
    </div>
  )
}
