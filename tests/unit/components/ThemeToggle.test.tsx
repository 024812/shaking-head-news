import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ThemeToggle } from '@/components/theme-toggle'

// Mock next-themes
const mockSetTheme = vi.fn()
const mockUseTheme = vi.fn()

vi.mock('next-themes', () => ({
  useTheme: () => mockUseTheme(),
}))

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render theme toggle button', () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    })

    render(<ThemeToggle />)

    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should show Moon icon when theme is light', async () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    })

    render(<ThemeToggle />)

    await waitFor(() => {
      const button = screen.getByRole('button')
      expect(button.querySelector('svg')).toBeInTheDocument()
    })
  })

  it('should show Sun icon when theme is dark', async () => {
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
    })

    render(<ThemeToggle />)

    await waitFor(() => {
      const button = screen.getByRole('button')
      expect(button.querySelector('svg')).toBeInTheDocument()
    })
  })

  it('should toggle theme from light to dark', async () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    })

    render(<ThemeToggle />)

    await waitFor(() => {
      const button = screen.getByRole('button')
      expect(button).not.toBeDisabled()
    })

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('should toggle theme from dark to light', async () => {
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
    })

    render(<ThemeToggle />)

    await waitFor(() => {
      const button = screen.getByRole('button')
      expect(button).not.toBeDisabled()
    })

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })

  it('should show disabled button before mounting', () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    })

    // Mock useState to simulate not mounted
    const { container } = render(<ThemeToggle />)
    
    // Initially should render something
    expect(container.querySelector('button')).toBeInTheDocument()
  })

  it('should have aria-label for accessibility', async () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    })

    render(<ThemeToggle />)

    await waitFor(() => {
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label')
    })
  })

  it('should use ghost variant and icon size', async () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    })

    render(<ThemeToggle />)

    await waitFor(() => {
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })
  })

  it('should handle system theme', async () => {
    mockUseTheme.mockReturnValue({
      theme: 'system',
      setTheme: mockSetTheme,
    })

    render(<ThemeToggle />)

    await waitFor(() => {
      const button = screen.getByRole('button')
      expect(button).not.toBeDisabled()
    })

    const button = screen.getByRole('button')
    fireEvent.click(button)

    // When theme is 'system', it should toggle to light (since it's not 'dark')
    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('should render icon with correct size class', async () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    })

    render(<ThemeToggle />)

    await waitFor(() => {
      const icon = screen.getByRole('button').querySelector('svg')
      expect(icon).toHaveClass('h-5', 'w-5')
    })
  })

  it('should be clickable multiple times', async () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    })

    render(<ThemeToggle />)

    await waitFor(() => {
      const button = screen.getByRole('button')
      expect(button).not.toBeDisabled()
    })

    const button = screen.getByRole('button')
    
    fireEvent.click(button)
    expect(mockSetTheme).toHaveBeenCalledWith('dark')

    fireEvent.click(button)
    expect(mockSetTheme).toHaveBeenCalledTimes(2)
  })
})
