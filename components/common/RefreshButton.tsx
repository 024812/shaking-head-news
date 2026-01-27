'use client'

import { Button } from '@/components/ui/button'
import { RotateCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { useTranslations } from 'next-intl'

export function RefreshButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const t = useTranslations('news')

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRefresh}
      disabled={isPending}
      className="gap-2"
    >
      <RotateCw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
      {isPending ? t('refreshing') : t('refresh')}
    </Button>
  )
}
