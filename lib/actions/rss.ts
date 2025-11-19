'use server'

import { auth } from '@/lib/auth'
import { getStorageItem, setStorageItem, StorageKeys } from '@/lib/storage'
import { RSSSourceSchema, RSSSource } from '@/types/rss'
import { revalidateTag } from 'next/cache'
import {
  AuthError,
  NotFoundError,
  ValidationError,
  logError,
  validateOrThrow,
} from '@/lib/utils/error-handler'
import { rateLimitByUser, rateLimitByAction, RateLimitTiers } from '@/lib/rate-limit'
import { sanitizeUrl, sanitizeString, sanitizeObject } from '@/lib/utils/input-validation'

// 获取用户的 RSS 源列表
export async function getRSSSources(): Promise<RSSSource[]> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return []
    }

    const key = StorageKeys.userRSSSources(session.user.id)
    const sources = (await getStorageItem<unknown[]>(key)) || []
    return sources.map((s: unknown) => validateOrThrow(RSSSourceSchema, s))
  } catch (error) {
    logError(error, {
      action: 'getRSSSources',
    })
    return []
  }
}

// 添加 RSS 源
export async function addRSSSource(source: Omit<RSSSource, 'id' | 'order' | 'failureCount'>) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      throw new AuthError('Please sign in to add RSS sources')
    }

    // 速率限制：每15分钟最多添加5个RSS源
    const rateLimitResult = await rateLimitByAction(session.user.id, 'add-rss', {
      ...RateLimitTiers.STRICT,
    })

    if (!rateLimitResult.success) {
      throw new Error('Too many RSS sources added. Please try again later.')
    }

    // 清理和验证输入
    const sanitizedUrl = sanitizeUrl(source.url)
    if (!sanitizedUrl) {
      throw new ValidationError('Invalid RSS URL')
    }

    const sanitizedSource = {
      ...source,
      url: sanitizedUrl,
      name: sanitizeString(source.name, { maxLength: 200 }),
      description: source.description
        ? sanitizeString(source.description, { maxLength: 500 })
        : undefined,
      tags: source.tags.map((tag) => sanitizeString(tag, { maxLength: 50 })),
    }

    const sources = await getRSSSources()

    // 限制每个用户最多50个RSS源
    if (sources.length >= 50) {
      throw new ValidationError('Maximum number of RSS sources (50) reached')
    }

    const newSource: RSSSource = {
      ...sanitizedSource,
      id: globalThis.crypto.randomUUID(),
      order: sources.length,
      failureCount: 0,
    }

    // 验证 RSS URL
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(newSource.url, {
        method: 'HEAD',
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new ValidationError('RSS URL is not accessible')
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error
      }
      throw new ValidationError('Invalid RSS URL or URL is not accessible')
    }

    // Validate the source data
    const validatedSource = validateOrThrow(RSSSourceSchema, newSource)

    sources.push(validatedSource)
    const key = StorageKeys.userRSSSources(session.user.id)
    await setStorageItem(key, sources)

    return validatedSource
  } catch (error) {
    logError(error, {
      action: 'addRSSSource',
      source,
    })
    throw error
  }
}

// 更新 RSS 源
export async function updateRSSSource(id: string, updates: Partial<RSSSource>) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      throw new AuthError('Please sign in to update RSS sources')
    }

    // 速率限制：每分钟最多100次更新 (Relaxed)
    const rateLimitResult = await rateLimitByUser(session.user.id, {
      ...RateLimitTiers.RELAXED,
    })

    if (!rateLimitResult.success) {
      throw new Error('Too many requests. Please try again later.')
    }

    // 清理输入数据
    const sanitizedUpdates = sanitizeObject(updates, {
      maxLength: 500,
      allowHtml: false,
    })

    // 如果更新URL，验证它
    if (sanitizedUpdates.url) {
      const sanitizedUrl = sanitizeUrl(sanitizedUpdates.url)
      if (!sanitizedUrl) {
        throw new ValidationError('Invalid RSS URL')
      }
      sanitizedUpdates.url = sanitizedUrl
    }

    const sources = await getRSSSources()
    const index = sources.findIndex((s) => s.id === id)

    if (index === -1) {
      throw new NotFoundError('RSS source not found')
    }

    // 验证用户拥有此RSS源
    const source = sources[index]
    if (!source) {
      throw new AuthError('Unauthorized to update this RSS source')
    }

    const updatedSource = { ...source, ...sanitizedUpdates }

    // Validate the updated source
    const validatedSource = validateOrThrow(RSSSourceSchema, updatedSource)

    sources[index] = validatedSource
    const key = StorageKeys.userRSSSources(session.user.id)
    await setStorageItem(key, sources)

    // 清除该源的缓存
    revalidateTag(`rss-${validatedSource.url}`)

    return validatedSource
  } catch (error) {
    logError(error, {
      action: 'updateRSSSource',
      id,
      updates,
    })
    throw error
  }
}

// 删除 RSS 源
export async function deleteRSSSource(id: string) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      throw new AuthError('Please sign in to delete RSS sources')
    }

    const sources = await getRSSSources()
    const sourceToDelete = sources.find((s) => s.id === id)

    if (!sourceToDelete) {
      throw new NotFoundError('RSS source not found')
    }

    const filtered = sources.filter((s) => s.id !== id)

    const key = StorageKeys.userRSSSources(session.user.id)
    await setStorageItem(key, filtered)

    // Clear cache for the deleted source
    revalidateTag(`rss-${sourceToDelete.url}`)
  } catch (error) {
    logError(error, {
      action: 'deleteRSSSource',
      id,
    })
    throw error
  }
}

// 重新排序 RSS 源
export async function reorderRSSSources(sourceIds: string[]) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      throw new AuthError('Please sign in to reorder RSS sources')
    }

    const sources = await getRSSSources()
    const reordered = sourceIds.map((id, index) => {
      const source = sources.find((s) => s.id === id)
      if (!source) {
        throw new NotFoundError(`Source ${id} not found`)
      }
      return { ...source, order: index }
    })

    const key = StorageKeys.userRSSSources(session.user.id)
    await setStorageItem(key, reordered)
    return reordered
  } catch (error) {
    logError(error, {
      action: 'reorderRSSSources',
      sourceIds,
    })
    throw error
  }
}

// 导出 OPML
export async function exportOPML() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      throw new AuthError('Please sign in to export RSS sources')
    }

    const sources = await getRSSSources()

    if (sources.length === 0) {
      throw new ValidationError('No RSS sources to export')
    }

    const opml = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>Shaking Head News - RSS Sources</title>
  </head>
  <body>
    ${sources
      .map(
        (s) => `
    <outline text="${s.name}" 
             type="rss" 
             xmlUrl="${s.url}" 
             htmlUrl="${s.url}" />
    `
      )
      .join('')}
  </body>
</opml>`

    return opml
  } catch (error) {
    logError(error, {
      action: 'exportOPML',
    })
    throw error
  }
}
