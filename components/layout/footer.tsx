import Link from 'next/link'
import { Github, Heart } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* 链接 */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">快速链接</h3>
            <ul className="flex gap-4 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  首页
                </Link>
              </li>
              <li>
                <Link
                  href="/stats"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  统计
                </Link>
              </li>
              <li>
                <Link
                  href="/settings"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  设置
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  关于
                </Link>
              </li>
            </ul>
          </div>

          {/* GitHub */}
          <div className="flex items-center justify-start md:justify-end">
            <a
              href="https://github.com/024812/shaking-head-news"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
              <span>GitHub</span>
            </a>
          </div>
        </div>

        <div className="mt-6 border-t pt-6 text-center text-xs text-muted-foreground">
          <p className="flex items-center justify-center gap-1">
            用 <Heart className="h-3 w-3 text-red-500" /> 制作 by{' '}
            <a
              href="https://github.com/024812"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:text-foreground"
            >
              024812
            </a>
          </p>
          <p className="mt-1">© 2025 摇头看新闻. 保留所有权利.</p>
        </div>
      </div>
    </footer>
  )
}
