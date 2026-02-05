import type { Metadata } from 'next'
import Script from 'next/script'
import { Inter, Noto_Sans_SC } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Toaster } from '@/components/ui/toaster'
import { TiltWrapper } from '@/components/rotation/TiltWrapper'
import { UIWrapper } from '@/components/layout/UIWrapper'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { cookies } from 'next/headers'
import { WebVitals } from './web-vitals'
import { SessionProvider } from '@/components/auth/SessionProvider'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
})

const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  preload: false, // Don't preload to avoid blocking render
  variable: '--font-noto-sans-sc',
})

export const metadata: Metadata = {
  title: '摇头看新闻 - Shaking Head News',
  description:
    '在浏览新闻的同时，通过页面旋转帮助您改善颈椎健康。A modern web app with daily news and neck health features.',
  keywords: ['news', 'health', 'cervical spondylosis', 'neck exercise', '新闻', '颈椎健康'],
  authors: [{ name: '024812', url: 'https://github.com/024812' }],
  creator: '024812',
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://shaking-head-news.vercel.app',
    title: '摇头看新闻',
    description: '在浏览新闻的同时，通过页面旋转帮助您改善颈椎健康',
    siteName: '摇头看新闻',
  },
  twitter: {
    card: 'summary_large_image',
    title: '摇头看新闻',
    description: '在浏览新闻的同时，通过页面旋转帮助您改善颈椎健康',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Get locale from cookie or default to 'zh'
  const cookieStore = await cookies()
  const locale = cookieStore.get('locale')?.value || 'zh'

  // Load messages for the current locale
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* DNS Prefetch and Preconnect for external domains */}
        <link rel="dns-prefetch" href="https://news.ravelloh.top" />
        <link rel="preconnect" href="https://news.ravelloh.top" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} ${notoSansSC.variable} font-sans`}>
        {/* Google AdSense - optimized for performance */}
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
          <Script
            id="google-adsense"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
            strategy="lazyOnload"
            crossOrigin="anonymous"
          />
        )}
        <WebVitals />
        <SessionProvider>
          <NextIntlClientProvider messages={messages} locale={locale}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <UIWrapper>
                <TiltWrapper>
                  <div className="flex min-h-screen flex-col">
                    <Header />
                    <main className="flex-1">{children}</main>
                    <Footer />
                  </div>
                </TiltWrapper>
              </UIWrapper>
              <Toaster />
            </ThemeProvider>
          </NextIntlClientProvider>
        </SessionProvider>
        {/* Google AdSense */}
      </body>
    </html>
  )
}
