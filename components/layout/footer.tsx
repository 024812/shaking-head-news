import Link from 'next/link'
import { Github, Heart } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function Footer() {
  const t = useTranslations('nav')
  const tFooter = useTranslations('footer')
  const tHome = useTranslations('home')

  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* 关于 */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">{t('home')}</h3>
            <p className="text-sm text-muted-foreground">{tHome('subtitle')}</p>
          </div>

          {/* 链接 */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">{t('home')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t('home')}
                </Link>
              </li>
              <li>
                <Link
                  href="/settings"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t('settings')}
                </Link>
              </li>
              <li>
                <Link
                  href="/stats"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t('stats')}
                </Link>
              </li>
            </ul>
          </div>

          {/* 社交 */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">GitHub</h3>
            <div className="flex gap-4">
              <a
                href="https://github.com/024812/shaking-head-news"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-1">
            {tFooter('madeWith')} <Heart className="h-4 w-4 text-red-500" /> by{' '}
            <a
              href="https://github.com/024812"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:text-foreground"
            >
              024812
            </a>
          </p>
          <p className="mt-2">{tFooter('copyright')}</p>
        </div>
      </div>
    </footer>
  )
}
