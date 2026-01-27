import { Suspense } from 'react'
import { NewsDisplay } from '@/components/news/NewsDisplay'
import { NewsListSkeleton } from '@/components/news/NewsListSkeleton'
import { getTranslations } from 'next-intl/server'
import { getAiNewsItems, getHotListNews, getNews } from '@/lib/actions/news'
import { HOT_LIST_SOURCES } from '@/lib/api/hot-list'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { NewsList } from '@/components/news/NewsList'
import { AdBanner } from '@/components/ads/AdBanner'
import { auth } from '@/lib/auth'
import { getUserSettings } from '@/lib/actions/settings'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { RefreshButton } from '@/components/common/RefreshButton'

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
  const tNews = await getTranslations('news')
  const session = await auth()
  const settings = session?.user ? await getUserSettings() : null
  const isPro = settings?.isPro ?? false
  const isMember = !!session?.user

  // Fetch data
  // For guests: Daily + AI merged
  // For members: Daily, AI, Trending separated
  // Determine triggered sources from settings
  // Filter out invalid sources and 'everydaynews' (which is Daily Brief)
  // Dynamic sources are available to all logged-in users who enable them
  const enabledSourceIds = (settings?.newsSources || [])
    .filter((id) => id !== 'everydaynews')
    .filter((id) => HOT_LIST_SOURCES.some((s) => s.id === id))

  // Fetch data
  // For guests: Daily + AI merged
  // For members: Daily, AI, Trending, + Dynamic Sources
  const [dailyResponse, aiNews, ...dynamicSourcesData] = await Promise.all([
    getNews('zh').catch(() => ({ items: [], total: 0 })), // Fetch standard daily news explicitly
    getAiNewsItems().catch(() => []),
    ...enabledSourceIds.map((id) => {
      const sourceName = HOT_LIST_SOURCES.find((s) => s.id === id)?.name || id
      return getHotListNews(id, sourceName).catch(() => [])
    }),
  ])

  // Map dynamic data to source IDs for easy lookup
  const dynamicNewsMap = enabledSourceIds.reduce(
    (acc, id, index) => {
      // Cast to explicit array type to avoid unknown error
      acc[id] = (dynamicSourcesData[index] as import('@/types/news').NewsItem[]) || []
      return acc
    },
    {} as Record<string, import('@/types/news').NewsItem[]>
  )

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
            <TabsList className="scrollbar-hide mb-6 flex h-auto w-full justify-start overflow-x-auto whitespace-nowrap sm:w-auto">
              {/* Pro Custom Feed (Placeholder) */}
              {isPro && <TabsTrigger value="custom">My Feed</TabsTrigger>}

              <TabsTrigger value="daily">{tNews('daily')}</TabsTrigger>
              <TabsTrigger value="ai">{tNews('ai')}</TabsTrigger>

              {/* Dynamic Tabs */}
              {enabledSourceIds.map((id) => {
                const source = HOT_LIST_SOURCES.find((s) => s.id === id)
                return (
                  <TabsTrigger key={id} value={id}>
                    {source?.icon} {source?.name}
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {/* Pro Custom Content */}
            {isPro && (
              <TabsContent value="custom" className="min-h-[500px] space-y-4">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold">My Custom Feed</h2>
                </div>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No Custom Feeds</AlertTitle>
                  <AlertDescription>
                    You haven't added any custom RSS feeds yet. Go to Settings to add them.
                  </AlertDescription>
                </Alert>
              </TabsContent>
            )}

            <TabsContent value="daily" className="min-h-[500px] space-y-4">
              <Suspense fallback={<HomePageSkeleton />}>
                <NewsDisplay />
              </Suspense>
            </TabsContent>

            <TabsContent value="ai" className="min-h-[500px] space-y-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">IT News (AI)</h2>
              </div>
              <NewsList news={aiNews} showLoginCTA={!session?.user} />
            </TabsContent>

            {/* Dynamic Contents */}
            {enabledSourceIds.map((id) => {
              const source = HOT_LIST_SOURCES.find((s) => s.id === id)
              const news = dynamicNewsMap[id] || []
              return (
                <TabsContent key={id} value={id} className="min-h-[500px] space-y-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold">{source?.name}</h2>
                    <RefreshButton />
                  </div>
                  <NewsList news={news} showLoginCTA={!session?.user} />
                </TabsContent>
              )
            })}
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
