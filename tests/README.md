# Testing Guide

This directory contains all tests for the Shaking Head News application.

## Test Structure

```
tests/
├── setup.ts              # Global test setup and mocks
├── utils/
│   └── test-utils.tsx    # Custom testing utilities and helpers
├── unit/                 # Unit tests for individual functions/components
├── integration/          # Integration tests for feature workflows
└── e2e/                  # End-to-end tests with Playwright
```

## Testing Stack

- **Vitest**: Fast unit test framework with native ESM support
- **React Testing Library**: Component testing with user-centric queries
- **Playwright**: End-to-end browser testing
- **@testing-library/jest-dom**: Custom matchers for DOM assertions

## Running Tests

### Unit and Integration Tests (Vitest)

```bash
# Run all unit/integration tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests in UI mode
npm run test:ui
```

### E2E Tests (Playwright)

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e:ui

# Run E2E tests in headed mode (see browser)
npm run test:e2e:headed

# Run E2E tests for specific browser
npm run test:e2e -- --project=chromium
```

## Writing Tests

### Unit Tests

Unit tests should focus on testing individual functions or components in isolation.

```typescript
// Example: tests/unit/utils/format.test.ts
import { describe, it, expect } from 'vitest'
import { formatDate } from '@/lib/utils/format'

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2024-01-01')
    expect(formatDate(date)).toBe('2024-01-01')
  })
})
```

### Component Tests

Component tests should test user interactions and component behavior.

```typescript
// Example: tests/unit/components/Button.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/tests/utils/test-utils'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('should call onClick when clicked', async () => {
    const onClick = vi.fn()
    const { user } = render(<Button onClick={onClick}>Click me</Button>)
    
    await user.click(screen.getByText('Click me'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
```

### Server Actions Tests

Test Server Actions by mocking external dependencies.

```typescript
// Example: tests/unit/actions/settings.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateSettings } from '@/lib/actions/settings'

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue({
    user: { id: 'test-user-id' }
  })
}))

vi.mock('@/lib/storage', () => ({
  storage: {
    get: vi.fn(),
    set: vi.fn(),
  }
}))

describe('updateSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should update user settings', async () => {
    const settings = { language: 'en' }
    await updateSettings(settings)
    
    expect(storage.set).toHaveBeenCalled()
  })
})
```

### E2E Tests

E2E tests should test complete user workflows.

```typescript
// Example: tests/e2e/news-browsing.spec.ts
import { test, expect } from '@playwright/test'

test.describe('News Browsing', () => {
  test('should display news on homepage', async ({ page }) => {
    await page.goto('/')
    
    // Wait for news to load
    await page.waitForSelector('[data-testid="news-list"]')
    
    // Check if news items are displayed
    const newsItems = await page.locator('[data-testid="news-item"]').count()
    expect(newsItems).toBeGreaterThan(0)
  })

  test('should refresh news when clicking refresh button', async ({ page }) => {
    await page.goto('/')
    
    // Click refresh button
    await page.click('[data-testid="refresh-button"]')
    
    // Wait for loading state
    await page.waitForSelector('[data-testid="loading"]')
    
    // Wait for news to reload
    await page.waitForSelector('[data-testid="news-list"]')
  })
})
```

## Test Utilities

The `tests/utils/test-utils.tsx` file provides helpful utilities:

- `renderWithProviders`: Render components with necessary providers
- `mockSession`: Mock authenticated user session
- `mockUserSettings`: Mock user settings data
- `mockNewsItems`: Mock news data
- `mockRSSSources`: Mock RSS sources
- `mockUserStats`: Mock statistics data
- `createMockResponse`: Create mock fetch responses

## Mocking

### Mocking Next.js Features

The setup file automatically mocks:
- `next/navigation` (useRouter, usePathname, etc.)
- `next-intl` (useTranslations, useLocale)
- `next-themes` (useTheme)
- `framer-motion` (motion components)

### Mocking External APIs

Use Vitest's `vi.mock()` to mock external dependencies:

```typescript
vi.mock('@/lib/storage', () => ({
  storage: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  }
}))
```

### Mocking Server Actions

Server Actions can be mocked at the module level:

```typescript
vi.mock('@/lib/actions/news', () => ({
  getNews: vi.fn().mockResolvedValue(mockNewsItems),
  refreshNews: vi.fn().mockResolvedValue(undefined),
}))
```

## Coverage Goals

- **Overall Coverage**: 70%+
- **Critical Paths**: 90%+
- **Server Actions**: 80%+
- **UI Components**: 60%+

## Best Practices

1. **Test Behavior, Not Implementation**: Focus on what the user sees and does
2. **Use Semantic Queries**: Prefer `getByRole`, `getByLabelText` over `getByTestId`
3. **Avoid Testing Implementation Details**: Don't test internal state or methods
4. **Keep Tests Simple**: One assertion per test when possible
5. **Use Descriptive Test Names**: Test names should describe the expected behavior
6. **Mock External Dependencies**: Don't make real API calls in tests
7. **Clean Up After Tests**: Use `afterEach` to reset mocks and state
8. **Test Accessibility**: Use `getByRole` to ensure components are accessible

## Debugging Tests

### Vitest

```bash
# Run tests with debugging
npm run test -- --inspect-brk

# Run specific test file
npm run test -- path/to/test.test.ts

# Run tests matching pattern
npm run test -- -t "pattern"
```

### Playwright

```bash
# Run with Playwright Inspector
npm run test:e2e -- --debug

# Run with headed browser
npm run test:e2e:headed

# Generate test code
npx playwright codegen http://localhost:3000
```

## CI/CD Integration

Tests are automatically run in CI/CD pipelines:

- Unit/Integration tests run on every commit
- E2E tests run on pull requests
- Coverage reports are generated and uploaded

## Troubleshooting

### Common Issues

1. **Tests timing out**: Increase timeout in test or config
2. **Mock not working**: Ensure mock is defined before import
3. **Component not rendering**: Check if all providers are included
4. **E2E test flaky**: Add proper wait conditions

### Getting Help

- Check Vitest docs: https://vitest.dev/
- Check Testing Library docs: https://testing-library.com/
- Check Playwright docs: https://playwright.dev/
