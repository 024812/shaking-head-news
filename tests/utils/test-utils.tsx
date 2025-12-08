import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'

/**
 * Custom render function that wraps components with common providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { ...options })
}

/**
 * Mock user session for testing authenticated components
 */
export const mockSession = {
  user: {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    image: 'https://example.com/avatar.jpg',
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
}

/**
 * Mock user settings for testing
 */
export const mockUserSettings = {
  userId: 'test-user-id',
  language: 'zh' as const,
  theme: 'light' as const,
  rotationMode: 'continuous' as const,
  rotationInterval: 10,
  animationEnabled: true,
  fontSize: 'medium' as const,
  layoutMode: 'normal' as const,
  dailyGoal: 30,
  notificationsEnabled: true,
  newsSources: ['everydaynews'],
  activeSource: 'everydaynews',
}

/**
 * Mock news items for testing
 */
export const mockNewsItems = [
  {
    id: '1',
    title: 'Test News 1',
    description: 'Test description 1',
    url: 'https://example.com/news/1',
    source: 'everydaynews',
    publishedAt: new Date().toISOString(),
    category: 'technology',
  },
  {
    id: '2',
    title: 'Test News 2',
    description: 'Test description 2',
    url: 'https://example.com/news/2',
    source: 'everydaynews',
    publishedAt: new Date().toISOString(),
    category: 'business',
  },
]

/**
 * Mock RSS sources for testing
 */
export const mockRSSSources = [
  {
    id: '1',
    name: 'Test RSS 1',
    url: 'https://example.com/rss1.xml',
    description: 'Test RSS feed 1',
    language: 'zh' as const,
    enabled: true,
    tags: ['tech'],
    order: 0,
    failureCount: 0,
  },
  {
    id: '2',
    name: 'Test RSS 2',
    url: 'https://example.com/rss2.xml',
    description: 'Test RSS feed 2',
    language: 'en' as const,
    enabled: true,
    tags: ['news'],
    order: 1,
    failureCount: 0,
  },
]

/**
 * Mock user stats for testing
 */
export const mockUserStats = {
  userId: 'test-user-id',
  date: new Date().toISOString().split('T')[0],
  rotationCount: 10,
  totalDuration: 300,
  records: [
    {
      timestamp: Date.now() - 1000,
      angle: 5,
      duration: 30,
    },
    {
      timestamp: Date.now(),
      angle: -5,
      duration: 30,
    },
  ],
}

/**
 * Wait for async operations to complete
 */
export const waitForAsync = () =>
  new Promise((resolve) => setTimeout(resolve, 0))

/**
 * Create a mock fetch response
 */
export function createMockResponse<T>(data: T, ok = true, status = 200) {
  return {
    ok,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
    headers: new Headers(),
    redirected: false,
    statusText: ok ? 'OK' : 'Error',
    type: 'basic' as ResponseType,
    url: '',
    clone: function () {
      return this
    },
    body: null,
    bodyUsed: false,
    arrayBuffer: async () => new ArrayBuffer(0),
    blob: async () => new Blob(),
    formData: async () => new FormData(),
  } as Response
}

// Re-export everything from testing library
export * from '@testing-library/react'
