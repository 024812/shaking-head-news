import Link from 'next/link'
import { Newspaper, User } from 'lucide-react'
import { ThemeToggle } from '@/components/settings/ThemeToggle'
import { Button } from '@/components/ui/button'
import { getTranslations } from 'next-intl/server'
import { auth } from '@/lib/auth'
import { LogoutButton } from '@/components/auth/LogoutButton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export async function Header() {
  const session = await auth()
  const t = await getTranslations('nav')
  const tCommon = await getTranslations('common')

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md transition-colors duration-200">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 transition-opacity duration-200 hover:opacity-80">
            <Newspaper className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">{tCommon('appName')}</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link 
              href="/" 
              className="text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-primary"
            >
              {t('home')}
            </Link>
            <Link
              href="/stats"
              className="text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-primary"
            >
              {t('stats')}
            </Link>
            <Link
              href="/settings"
              className="text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-primary"
            >
              {t('settings')}
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-primary"
            >
              关于
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm leading-none font-medium">{session.user.name}</p>
                    <p className="text-muted-foreground text-xs leading-none">
                      {session.user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    {t('settings')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/stats" className="cursor-pointer">
                    {t('stats')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <LogoutButton />
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">{t('login')}</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
