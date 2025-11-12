import { RotationControls } from '@/components/rotation/RotationControls'
import { getTranslations } from 'next-intl/server'

export default async function HomePage() {
  const t = await getTranslations('home')

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            {t('title')}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">{t('subtitle')}</p>
        </div>

        {/* Rotation Controls */}
        <div className="flex justify-center">
          <RotationControls />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
            <h3 className="mb-2 text-xl font-semibold">
              {t('features.news.title')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('features.news.description')}
            </p>
          </div>

          <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
            <h3 className="mb-2 text-xl font-semibold">
              {t('features.rotation.title')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('features.rotation.description')}
            </p>
          </div>

          <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
            <h3 className="mb-2 text-xl font-semibold">
              {t('features.stats.title')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('features.stats.description')}
            </p>
          </div>

          <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
            <h3 className="mb-2 text-xl font-semibold">
              {t('features.i18n.title')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('features.i18n.description')}
            </p>
          </div>

          <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
            <h3 className="mb-2 text-xl font-semibold">
              {t('features.sync.title')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('features.sync.description')}
            </p>
          </div>

          <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
            <h3 className="mb-2 text-xl font-semibold">
              {t('features.theme.title')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('features.theme.description')}
            </p>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {t('developmentNote')}
          </p>
        </div>
      </div>
    </div>
  )
}
