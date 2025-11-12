'use client'

import { useTranslations } from 'next-intl'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { updateSettings } from '@/lib/actions/settings'
import { useToast } from '@/hooks/use-toast'
import { useState, useTransition } from 'react'
import { Globe } from 'lucide-react'

interface LanguageSelectorProps {
  currentLanguage: 'zh' | 'en'
}

export function LanguageSelector({ currentLanguage }: LanguageSelectorProps) {
  const t = useTranslations('settings')
  const { toast } = useToast()
  const [language, setLanguage] = useState<'zh' | 'en'>(currentLanguage)
  const [isPending, startTransition] = useTransition()

  const handleLanguageChange = async (newLanguage: 'zh' | 'en') => {
    setLanguage(newLanguage)

    startTransition(async () => {
      try {
        // Update settings in storage
        await updateSettings({ language: newLanguage })

        // Set cookie for next-intl (client-side only)
        if (typeof document !== 'undefined') {
          // eslint-disable-next-line no-undef
          document.cookie = `locale=${newLanguage}; path=/; max-age=31536000`
        }

        toast({
          title: t('saveSuccess'),
          description: t('saveSuccessDescription'),
        })

        // Reload page to apply new language (client-side only)
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            // eslint-disable-next-line no-undef
            window.location.reload()
          }, 500)
        }
      } catch (error) {
        console.error('Failed to update language:', error)
        toast({
          title: t('saveError'),
          description: t('saveErrorDescription'),
          variant: 'destructive',
        })
        // Revert on error
        setLanguage(currentLanguage)
      }
    })
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="language" className="flex items-center gap-2">
        <Globe className="h-4 w-4" />
        {t('language')}
      </Label>
      <Select
        value={language}
        onValueChange={(value) => handleLanguageChange(value as 'zh' | 'en')}
        disabled={isPending}
      >
        <SelectTrigger id="language">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="zh">{t('chinese')}</SelectItem>
          <SelectItem value="en">{t('english')}</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-sm text-muted-foreground">{t('languageDescription')}</p>
    </div>
  )
}
