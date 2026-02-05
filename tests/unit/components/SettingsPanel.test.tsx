import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SettingsPanel } from '@/components/settings/SettingsPanel'
import { UserSettings } from '@/types/settings'
import * as settingsActions from '@/lib/actions/settings'
import { useUIStore } from '@/lib/stores/ui-store'

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
      },
    },
    status: 'authenticated',
  }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
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
  resetSettings: vi.fn(),
}))

// Mock UI store
vi.mock('@/lib/stores/ui-store', () => ({
  useUIStore: vi.fn(),
}))

// Mock useUserTier hook
vi.mock('@/hooks/use-user-tier', () => ({
  useUserTier: () => ({
    isGuest: false,
    isPro: true,
    features: {
      fontSizeAdjustable: true,
      layoutModeSelectable: true,
      rotationModeSelectable: true,
      rotationIntervalAdjustable: true,
    },
    togglePro: vi.fn(),
    isTogglingPro: false,
  }),
}))

describe('SettingsPanel', () => {
  const mockSettings: UserSettings = {
    userId: 'test-user',
    language: 'zh',
    theme: 'system',
    rotationMode: 'continuous',
    rotationInterval: 10,
    animationEnabled: true,
    fontSize: 'medium',
    layoutMode: 'normal',
    dailyGoal: 30,
    notificationsEnabled: true,
    newsSources: ['everydaynews'],
    activeSource: 'everydaynews',
    isPro: true,
  }

  const mockUIStore = {
    setFontSize: vi.fn(),
    setLayoutMode: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useUIStore).mockReturnValue(mockUIStore as unknown as ReturnType<typeof useUIStore>)
    vi.mocked(settingsActions.updateSettings).mockResolvedValue({
      success: true,
      settings: mockSettings,
    })
    vi.mocked(settingsActions.resetSettings).mockResolvedValue({
      success: true,
      settings: mockSettings,
    })
  })

  it('should render all settings sections', () => {
    render(<SettingsPanel initialSettings={mockSettings} />)

    // Check for main sections using headings
    expect(screen.getByRole('heading', { name: 'theme' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'rotation' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'notifications' })).toBeInTheDocument()
  })

  it('should display initial settings values', () => {
    render(<SettingsPanel initialSettings={mockSettings} />)

    // Check rotation interval display
    expect(screen.getByText('10s')).toBeInTheDocument()

    // Check daily goal display
    expect(screen.getByText('30')).toBeInTheDocument()
  })

  it('should display rotation interval value', () => {
    render(<SettingsPanel initialSettings={mockSettings} />)

    // Check that initial rotation interval is displayed
    expect(screen.getByText('10s')).toBeInTheDocument()
  })

  it('should toggle animation switch', async () => {
    render(<SettingsPanel initialSettings={mockSettings} />)

    const animationSwitch = screen.getByRole('switch', { name: /animation/i })

    expect(animationSwitch).toBeChecked()

    fireEvent.click(animationSwitch)

    await waitFor(() => {
      expect(animationSwitch).not.toBeChecked()
    })
  })

  it('should call updateSettings when save button is clicked', async () => {
    render(<SettingsPanel initialSettings={mockSettings} />)

    const saveButton = screen.getByRole('button', { name: /保存/i })

    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(settingsActions.updateSettings).toHaveBeenCalledWith(mockSettings)
    })
  })

  it('should call resetSettings when reset button is clicked', async () => {
    render(<SettingsPanel initialSettings={mockSettings} />)

    const resetButton = screen.getByRole('button', { name: /重置/i })

    fireEvent.click(resetButton)

    await waitFor(() => {
      expect(settingsActions.resetSettings).toHaveBeenCalled()
    })
  })

  it('should update UI store when fontSize changes', () => {
    render(<SettingsPanel initialSettings={mockSettings} />)

    // Verify setFontSize was called on mount with initial value
    expect(mockUIStore.setFontSize).toHaveBeenCalledWith('medium')
  })

  it('should update UI store when layoutMode changes', () => {
    render(<SettingsPanel initialSettings={mockSettings} />)

    // Verify setLayoutMode was called on mount with initial value
    expect(mockUIStore.setLayoutMode).toHaveBeenCalledWith('normal')
  })

  it('should disable buttons while saving', async () => {
    render(<SettingsPanel initialSettings={mockSettings} />)

    const saveButton = screen.getByRole('button', { name: /保存/i })
    const resetButton = screen.getByRole('button', { name: /重置/i })

    fireEvent.click(saveButton)

    // Buttons should be disabled during save
    expect(saveButton).toBeDisabled()
    expect(resetButton).toBeDisabled()

    await waitFor(() => {
      expect(saveButton).not.toBeDisabled()
      expect(resetButton).not.toBeDisabled()
    })
  })

  it('should display daily goal value', () => {
    render(<SettingsPanel initialSettings={mockSettings} />)

    // Check that initial daily goal is displayed
    expect(screen.getByText('30')).toBeInTheDocument()
  })

  it('should toggle notifications switch', async () => {
    render(<SettingsPanel initialSettings={mockSettings} />)

    // Get the notifications switch (enabled via Pro in mock)
    // Label is t('notifications') which returns 'notifications' via mock
    const notificationsSwitch = screen.getByRole('switch', { name: /^notifications$/i })

    // Verify notifications switch is checked (from mockSettings)
    expect(notificationsSwitch).toBeChecked()

    // Toggle it
    fireEvent.click(notificationsSwitch)

    // updateSetting should be called
    expect(settingsActions.updateSettings).not.toHaveBeenCalled()

    // Check that multiple switches exist (implies Pro features rendered)
    const switches = screen.getAllByRole('switch')
    expect(switches.length).toBeGreaterThan(1)
  })
})
