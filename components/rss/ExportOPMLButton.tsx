'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { exportOPML } from '@/lib/actions/rss'
import { Download } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function ExportOPMLButton() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const t = useTranslations('rss')

  const handleExport = async () => {
    setLoading(true)
    try {
      const opml = await exportOPML()
      const blob = new Blob([opml], { type: 'application/xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rss-sources-${new Date().toISOString().split('T')[0]}.opml`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: t('success'),
        description: 'OPML file exported successfully',
      })
    } catch (error) {
      console.error('Failed to export OPML:', error)
      toast({
        title: t('error'),
        description: 'Failed to export OPML',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" onClick={handleExport} disabled={loading}>
      <Download className="mr-2 h-4 w-4" />
      {loading ? 'Exporting...' : t('exportOPML')}
    </Button>
  )
}
