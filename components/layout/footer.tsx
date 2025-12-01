import { Github, Heart } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto py-6">
        <div className="text-muted-foreground flex flex-col items-center justify-between gap-4 text-xs sm:flex-row">
          {/* 版权信息 */}
          <div className="flex items-center gap-1">
            <span>用</span>
            <Heart className="h-3 w-3 text-red-500" />
            <span>制作 by</span>
            <a
              href="https://github.com/024812"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground font-medium"
            >
              024812
            </a>
            <span className="mx-2">·</span>
            <span>© 2025 摇头看新闻. 保留所有权利.</span>
          </div>

          {/* GitHub 链接 */}
          <a
            href="https://github.com/024812/shaking-head-news"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground flex items-center gap-2 transition-colors"
            aria-label="GitHub"
          >
            <Github className="h-4 w-4" />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </footer>
  )
}
