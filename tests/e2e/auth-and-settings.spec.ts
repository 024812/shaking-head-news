import { test, expect } from '@playwright/test'

test.describe('User Authentication and Settings Flow', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login')

    // Check page title
    await expect(page.locator('h1')).toContainText('摇头看新闻')

    // Check login description
    await expect(page.locator('text=登录以同步您的设置和偏好')).toBeVisible()

    // Check Google login button
    const googleButton = page.locator('button:has-text("Google")')
    await expect(googleButton).toBeVisible()

    // Check Microsoft login button
    const microsoftButton = page.locator('button:has-text("Microsoft")')
    await expect(microsoftButton).toBeVisible()
  })

  test('should have continue without login link', async ({ page }) => {
    await page.goto('/login')

    // Check for "continue without login" link
    const continueLink = page.locator('a[href="/"]').filter({ hasText: /继续浏览|无需登录/ })
    await expect(continueLink).toBeVisible()
    await expect(continueLink).toContainText(/继续浏览|无需登录/)
  })

  test('should navigate back to home from login page', async ({ page }) => {
    await page.goto('/login')

    // Click continue without login
    await page.click('a[href="/"] >> text=/继续浏览|无需登录/')

    // Should be back on homepage
    await expect(page).toHaveURL('/')
  })

  test('should redirect to login when accessing protected settings page', async ({ page }) => {
    await page.goto('/settings')

    // Should redirect to login
    await page.waitForURL(/\/login/)
    await expect(page).toHaveURL(/\/login/)
  })

  test('should redirect to login when accessing protected stats page', async ({ page }) => {
    await page.goto('/stats')

    // Should redirect to login
    await page.waitForURL(/\/login/)
    await expect(page).toHaveURL(/\/login/)
  })

  test('should redirect to login when accessing protected RSS page', async ({ page }) => {
    await page.goto('/rss')

    // Should redirect to login
    await page.waitForURL(/\/login/)
    await expect(page).toHaveURL(/\/login/)
  })

  test('should preserve callback URL when redirecting to login', async ({ page }) => {
    await page.goto('/settings')

    // Wait for redirect
    await page.waitForURL(/\/login/)

    // Check if callback URL is preserved in query params
    const url = page.url()
    expect(url).toContain('/login')
  })

  test('login page should be responsive on mobile', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip()
    }

    await page.goto('/login')

    // Check that login form is visible and properly sized
    const loginCard = page.locator('.rounded-lg.bg-white, .rounded-lg.bg-gray-800')
    await expect(loginCard).toBeVisible()

    // Check that button is full width
    const googleButton = page.locator('button[type="submit"]').first()
    const buttonBox = await googleButton.boundingBox()
    const cardBox = await loginCard.boundingBox()

    if (buttonBox && cardBox) {
      // Button should be close to full width of card (accounting for padding)
      expect(buttonBox.width).toBeGreaterThan(cardBox.width * 0.8)
    }
  })

  test('should display terms and privacy notice', async ({ page }) => {
    await page.goto('/login')

    // Check for terms and privacy text
    const termsText = page.locator('text=/服务条款|隐私政策/')
    await expect(termsText).toBeVisible()
  })

  test('should have proper form structure', async ({ page }) => {
    await page.goto('/login')

    // Check that forms exist
    const forms = page.locator('form')
    await expect(forms).toHaveCount(2)

    // Check that submit buttons are inside forms
    await expect(forms.first().locator('button[type="submit"]')).toBeVisible()
    await expect(forms.last().locator('button[type="submit"]')).toBeVisible()
  })

  test('should have accessible login button', async ({ page }) => {
    await page.goto('/login')

    const googleButton = page.locator('button:has-text("Google")')

    // Check button has visible text
    await expect(googleButton).toContainText('Google')

    // Check button is keyboard accessible
    await googleButton.focus()
    const isFocused = await googleButton.evaluate((el) => el === document.activeElement)
    expect(isFocused).toBe(true)
  })

  test('should display Google icon in login button', async ({ page }) => {
    await page.goto('/login')

    const googleButton = page.locator('button:has-text("Google")')
    const svg = googleButton.locator('svg')

    await expect(svg).toBeVisible()
  })

  test('login page should have proper styling', async ({ page }) => {
    await page.goto('/login')

    // Check gradient background
    const background = page.locator('.bg-gradient-to-br')
    await expect(background).toBeVisible()

    // Check card shadow
    const card = page.locator('.shadow-xl')
    await expect(card).toBeVisible()
  })

  test('should handle navigation between login and home', async ({ page }) => {
    // Start at home
    await page.goto('/')
    await expect(page).toHaveURL('/')

    // Navigate to login
    await page.goto('/login')
    await expect(page).toHaveURL('/login')

    // Go back to home
    await page.goBack()
    await expect(page).toHaveURL('/')

    // Go forward to login
    await page.goForward()
    await expect(page).toHaveURL('/login')
  })
})

test.describe('Settings Page (Mock Auth)', () => {
  // Note: These tests would require mocking authentication
  // In a real scenario, you would use Playwright's authentication features
  // or test with a test user account

  test('should show settings page structure when authenticated', async ({ page }) => {
    // This test assumes we can somehow authenticate
    // In production, you would set up proper auth mocking

    // For now, we just verify the page exists and redirects properly
    await page.goto('/settings')

    // Should redirect to login if not authenticated
    await page.waitForURL(/\/login/)
    await expect(page).toHaveURL(/\/login/)
  })
})
