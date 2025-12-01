import { getTranslations } from 'next-intl/server'

export const metadata = {
  title: '关于 - 摇头看新闻',
  description: '了解摇头看新闻的功能特色',
}

export default async function AboutPage() {
  const t = await getTranslations('home')

  return (
    <div className="container mx-auto py-8 md:py-12">
      <div className="mx-auto max-w-4xl space-y-6 md:space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            {t('title')}
          </h1>
          <p className="text-muted-foreground mt-4 text-lg">{t('subtitle')}</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
            <h3 className="mb-2 text-xl font-semibold">{t('features.news.title')}</h3>
            <p className="text-muted-foreground text-sm">{t('features.news.description')}</p>
          </div>

          <div className="bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
            <h3 className="mb-2 text-xl font-semibold">{t('features.rotation.title')}</h3>
            <p className="text-muted-foreground text-sm">{t('features.rotation.description')}</p>
          </div>

          <div className="bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
            <h3 className="mb-2 text-xl font-semibold">{t('features.stats.title')}</h3>
            <p className="text-muted-foreground text-sm">{t('features.stats.description')}</p>
          </div>

          <div className="bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
            <h3 className="mb-2 text-xl font-semibold">{t('features.i18n.title')}</h3>
            <p className="text-muted-foreground text-sm">{t('features.i18n.description')}</p>
          </div>

          <div className="bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
            <h3 className="mb-2 text-xl font-semibold">{t('features.sync.title')}</h3>
            <p className="text-muted-foreground text-sm">{t('features.sync.description')}</p>
          </div>

          <div className="bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
            <h3 className="mb-2 text-xl font-semibold">{t('features.theme.title')}</h3>
            <p className="text-muted-foreground text-sm">{t('features.theme.description')}</p>
          </div>
        </div>

        <div className="bg-card text-card-foreground space-y-6 rounded-lg border p-6 shadow-sm">
          <div>
            <h2 className="mb-3 text-2xl font-semibold">项目背景</h2>
            <p className="text-muted-foreground">
              长时间使用电脑和手机会导致颈椎问题。本项目通过在浏览新闻时自动旋转页面，帮助用户在获取信息的同时活动颈椎，改善颈椎健康。
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-semibold">技术栈</h2>
            <div className="flex flex-wrap gap-2">
              <span className="bg-primary/10 rounded-full px-3 py-1 text-sm">Next.js 15</span>
              <span className="bg-primary/10 rounded-full px-3 py-1 text-sm">React 19</span>
              <span className="bg-primary/10 rounded-full px-3 py-1 text-sm">TypeScript</span>
              <span className="bg-primary/10 rounded-full px-3 py-1 text-sm">Tailwind CSS</span>
              <span className="bg-primary/10 rounded-full px-3 py-1 text-sm">Framer Motion</span>
              <span className="bg-primary/10 rounded-full px-3 py-1 text-sm">NextAuth.js</span>
              <span className="bg-primary/10 rounded-full px-3 py-1 text-sm">Upstash Redis</span>
            </div>
          </div>

          <div className="border-t pt-6 text-center">
            <p className="text-muted-foreground text-sm">{t('developmentNote')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
