import { cookies } from 'next/headers'

/**
 * Get the current locale from cookies
 * @returns The current locale ('zh' or 'en')
 */
export async function getLocale(): Promise<'zh' | 'en'> {
  const cookieStore = await cookies()
  const locale = cookieStore.get('locale')?.value
  return (locale === 'en' ? 'en' : 'zh') as 'zh' | 'en'
}

/**
 * Set the locale cookie
 * @param locale - The locale to set ('zh' or 'en')
 */
export async function setLocale(locale: 'zh' | 'en'): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set('locale', locale, {
    path: '/',
    maxAge: 31536000, // 1 year
  })
}
