/**
 * ImportOPMLButton Component
 * OPML 导入按钮 - Pro 功能
 */

'use client'
import { useState, useRef, type ElementRef, type ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { importOPML } from '@/lib/actions/rss'
import { Upload } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

export function ImportOPMLButton() {
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<ElementRef<'input'>>(null)
  const { toast } = useToast()
  const t = useTranslations('rss')
  const router = useRouter()

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: ChangeEvent<ElementRef<'input'>>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 验证文件类型
    if (!file.name.endsWith('.opml') && !file.name.endsWith('.xml')) {
      toast({
        title: t('error'),
        description: '请选择 OPML 或 XML 文件',
        variant: 'destructive',
      })
      return
    }

    // 验证文件大小 (最大 1MB)
    if (file.size > 1024 * 1024) {
      toast({
        title: t('error'),
        description: '文件大小不能超过 1MB',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const content = await file.text()
      const result = await importOPML(content)

      toast({
        title: t('success'),
        description: `成功导入 ${result.imported} 个 RSS 源${result.skipped > 0 ? `，跳过 ${result.skipped} 个重复或超出限制` : ''}`,
      })

      router.refresh()
    } catch (error) {
      console.error('Failed to import OPML:', error)
      toast({
        title: t('error'),
        description: error instanceof Error ? error.message : '导入 OPML 失败',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
      // 重置 input 以允许重复选择同一文件
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".opml,.xml"
        onChange={handleFileChange}
        className="hidden"
      />
      <Button variant="outline" onClick={handleClick} disabled={loading}>
        <Upload className="mr-2 h-4 w-4" />
        {loading ? '导入中...' : t('importOPML')}
      </Button>
    </>
  )
}

export default ImportOPMLButton
