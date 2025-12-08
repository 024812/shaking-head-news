'use client'

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'

export function LogoutButton() {
  const t = useTranslations('nav')

  return (
    <DropdownMenuItem className="cursor-pointer" onClick={() => signOut({ callbackUrl: '/' })}>
      <LogOut className="mr-2 h-4 w-4" />
      <span>{t('logout')}</span>
    </DropdownMenuItem>
  )
}
