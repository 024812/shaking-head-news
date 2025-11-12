import Link from 'next/link'
import { Newspaper } from 'lucide-react'
import { ThemeToggle } from '@/components/settings/ThemeToggle'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'

export function Header() {
  const t = useTranslations('nav')
  const tCommon = useTranslations('common')

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Newspaper className="h-6 w-6" />
            <span className="text-xl font-bold">{tCommon('appName')}</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              {t('home')}
            </Link>
            <Link
              href="/settings"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              {t('settings')}
            </Link>
            <Link
              href="/stats"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              {t('stats')}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="outline" size="sm" asChild>
            <Link href="/login">{t('login')}</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
