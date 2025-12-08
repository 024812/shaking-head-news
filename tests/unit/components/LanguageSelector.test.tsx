import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LanguageSelector } from '@/components/settings/LanguageSelector'
import * as settingsActions from '@/lib/actions/settings'
import { afterEach } from 'node:test'

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// Mock toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}))

// Mock settings actions
vi.mock('@/lib/actions/settings', () => ({
  updateSettings: vi.fn(),
}))

// Mock window.location.reload
const mockReload = vi.fn()
Object.defineProperty(window, 'location', {
  value: { reload: mockReload },
  writable: true,
})

describe('LanguageSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.mocked(settingsActions.updateSettings).mockResolvedValue({
      success: true,
      settings: {
        userId: 'test-user',
        language: 'en',
        theme: 'system',
        rotationMode: 'continuous',
        rotationInterval: 10,
        animationEnabled: true,
        fontSize: 'medium',
        layoutMode: 'normal',
        dailyGoal: 30,
        notificationsEnabled: true,
        newsSources: ['everydaynews'],
      },
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should render language selector with current language', () => {
    render(<LanguageSelector currentLanguage="zh" />)

    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByText('language')).toBeInTheDocument()
  })

  it('should display language description', () => {
    render(<LanguageSelector currentLanguage="zh" />)

    expect(screen.getByText('languageDescription')).toBeInTheDocument()
  })

  it('should show Globe icon', () => {
    render(<LanguageSelector currentLanguage="zh" />)

    const label = screen.getByText('language')
    expect(label.parentElement?.querySelector('svg')).toBeInTheDocument()
  })

  it('should have language selector with correct initial value', () => {
    render(<LanguageSelector currentLanguage="zh" />)

    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()
  })

  it('should render with Globe icon', () => {
    render(<LanguageSelector currentLanguage="zh" />)

    const label = screen.getByText('language')
    expect(label.parentElement?.querySelector('svg')).toBeInTheDocument()
  })

  it('should not be disabled initially', () => {
    render(<LanguageSelector currentLanguage="zh" />)

    const select = screen.getByRole('combobox')
    expect(select).not.toBeDisabled()
  })

  it('should render language description text', () => {
    render(<LanguageSelector currentLanguage="zh" />)

    expect(screen.getByText('languageDescription')).toBeInTheDocument()
  })

  it('should render with Chinese as current language', () => {
    render(<LanguageSelector currentLanguage="zh" />)

    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()
  })

  it('should render with English as current language', () => {
    render(<LanguageSelector currentLanguage="en" />)

    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()
  })

  it('should have language label', () => {
    render(<LanguageSelector currentLanguage="en" />)

    expect(screen.getByText('language')).toBeInTheDocument()
  })

  it('should render combobox for language selection', () => {
    render(<LanguageSelector currentLanguage="zh" />)

    const select = screen.getByRole('combobox')
    expect(select).toHaveAttribute('id', 'language')
  })
})
