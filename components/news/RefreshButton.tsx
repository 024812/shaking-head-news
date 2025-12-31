'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { refreshNews } from '@/lib/actions/news'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

interface RefreshButtonProps {
  language?: 'zh' | 'en'
  source?: string
}

export function RefreshButton({ language, source }: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleRefresh = async () => {
    setIsRefreshing(true)

    try {
      await refreshNews(language, source)

      // Refresh the page to show new data
      router.refresh()

      toast({
        title: '刷新成功',
        description: '新闻内容已更新',
      })
    } catch (error) {
      toast({
        title: '刷新失败',
        description: error instanceof Error ? error.message : '请稍后重试',
        variant: 'destructive',
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <Button
      onClick={handleRefresh}
      disabled={isRefreshing}
      variant="outline"
      size="sm"
      data-testid="refresh-button"
    >
      <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      {isRefreshing ? '刷新中...' : '刷新'}
    </Button>
  )
}
