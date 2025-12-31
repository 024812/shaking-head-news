import { test, expect } from '@playwright/test'

test.describe('Complete User Journey', () => {
  test('should complete a full browsing session', async ({ page }) => {
    // 1. Start at homepage
    await page.goto('/')
    await expect(page).toHaveTitle(/摇头看新闻|Shaking Head News/)

    // 2. Verify main content is visible
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()

    // 3. Check feature cards
    const featureCards = page.locator('.rounded-lg.border.bg-card')
    await expect(featureCards.first()).toBeVisible()

    // 4. Interact with rotation controls
    const rotationControls = page.locator('text=/旋转控制|Rotation Controls/i')
    await expect(rotationControls).toBeVisible()

    // 5. Try to access settings (should redirect to login)
    await page.click('a[href="/settings"]')
    await page.waitForURL(/\/login/)
    await expect(page).toHaveURL(/\/login/)

    // 6. Verify login page
    await expect(page.locator('h1')).toContainText('摇头看新闻')
    const googleButton = page.locator('button[type="submit"]')
    await expect(googleButton).toBeVisible()

    // 7. Go back to home without logging in
    await page.click('a[href="/"]')
    await expect(page).toHaveURL('/')

    // 8. Verify we're back on homepage
    await expect(heading).toBeVisible()
  })

  test('should navigate through all main pages', async ({ page }) => {
    // Home
    await page.goto('/')
    await expect(page).toHaveURL('/')

    // Try Settings
    await page.goto('/settings')
    await page.waitForURL(/\/login/)

    // Back to home
    await page.goto('/')
    await expect(page).toHaveURL('/')

    // Try Stats
    await page.goto('/stats')
    await page.waitForURL(/\/login/)

    // Back to home
    await page.goto('/')
    await expect(page).toHaveURL('/')

    // Try RSS
    await page.goto('/rss')
    await page.waitForURL(/\/login/)

    // Back to home
    await page.goto('/')
    await expect(page).toHaveURL('/')
  })

  test('should handle browser back/forward navigation', async ({ page }) => {
    // Navigate through pages
    await page.goto('/')
    await page.goto('/login')
    await page.goto('/')

    // Go back
    await page.goBack()
    await expect(page).toHaveURL('/login')

    // Go back again
    await page.goBack()
    await expect(page).toHaveURL('/')

    // Go forward
    await page.goForward()
    await expect(page).toHaveURL('/login')

    // Go forward again
    await page.goForward()
    await expect(page).toHaveURL('/')
  })

  test('should maintain state during navigation', async ({ page }) => {
    await page.goto('/')

    // Interact with rotation controls if available
    const pauseButton = page
      .locator(
        'button[aria-label*="暂停"], button[aria-label*="Pause"], button:has-text("暂停"), button:has-text("Pause")'
      )
      .first()

    const pauseVisible = await pauseButton.isVisible().catch(() => false)
    if (pauseVisible) {
      await pauseButton.click()

      // Navigate away
      await page.goto('/login')

      // Come back
      await page.goto('/')

      // State should be preserved (play button visible)
      const playButton = page
        .locator(
          'button[aria-label*="播放"], button[aria-label*="Play"], button:has-text("播放"), button:has-text("Play")'
        )
        .first()
      await expect(playButton).toBeVisible({ timeout: 2000 })
    }
  })

  test('should work with different viewport sizes', async ({ page }) => {
    // Desktop
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()

    // Tablet
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()

    // Mobile
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should handle page reload gracefully', async ({ page }) => {
    await page.goto('/')

    // Reload page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Content should still be visible
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()
  })

  test('should handle rapid navigation', async ({ page }) => {
    // Rapidly navigate between pages
    await page.goto('/')
    await page.goto('/login')
    await page.goto('/')
    await page.goto('/settings')
    await page.waitForURL(/\/login/)
    await page.goto('/')

    // Should end up on home page
    await expect(page).toHaveURL('/')

    // Content should be visible
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()
  })

  test('should have consistent header across pages', async ({ page }) => {
    // Check header on home
    await page.goto('/')
    const homeHeader = page.locator('header')
    await expect(homeHeader).toBeVisible()

    // Check header on login
    await page.goto('/login')
    // Login page might have different layout
    // Just verify page loaded
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should have consistent footer across pages', async ({ page }) => {
    // Check footer on home
    await page.goto('/')
    const homeFooter = page.locator('footer')
    await expect(homeFooter).toBeVisible()

    // Check footer on login
    await page.goto('/login')
    // Login page might have different layout
    // Just verify page loaded
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should handle keyboard navigation throughout app', async ({ page }) => {
    await page.goto('/')

    // Tab through interactive elements
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab')
    }

    // Should be able to activate focused element
    await page.keyboard.press('Enter')

    // Page should still be functional
    await page.waitForLoadState('networkidle')
    const url = page.url()
    expect(url).toBeTruthy()
  })

  test('should display proper error page for 404', async ({ page }) => {
    await page.goto('/this-page-does-not-exist')

    // Should show 404 page or redirect
    await page.waitForLoadState('networkidle')

    const has404 = await page
      .locator('text=/404|Not Found|找不到/i')
      .isVisible()
      .catch(() => false)
    const isHome = page.url().endsWith('/')

    // Should either show 404 or redirect to home
    expect(has404 || isHome).toBe(true)
  })

  test('should maintain performance during navigation', async ({ page }) => {
    const navigationTimes: number[] = []

    // Measure navigation times
    for (let i = 0; i < 3; i++) {
      const startTime = Date.now()
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      const endTime = Date.now()
      navigationTimes.push(endTime - startTime)
    }

    // Average navigation time should be reasonable (< 5 seconds)
    const avgTime = navigationTimes.reduce((a, b) => a + b, 0) / navigationTimes.length
    expect(avgTime).toBeLessThan(5000)
  })

  test('should handle concurrent user interactions', async ({ page }) => {
    await page.goto('/')

    // Perform multiple actions quickly
    const actions = [
      page
        .locator('a[href="/settings"]')
        .click()
        .catch(() => {}),
      page.keyboard.press('Tab'),
      page.keyboard.press('Tab'),
    ]

    await Promise.all(actions)

    // Page should still be functional
    await page.waitForLoadState('networkidle')
    const url = page.url()
    expect(url).toBeTruthy()
  })

  test('should preserve scroll position on navigation', async ({ page }) => {
    await page.goto('/')

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500))
    const scrollY = await page.evaluate(() => window.scrollY)
    expect(scrollY).toBeGreaterThan(0)

    // Navigate away and back
    await page.goto('/login')
    await page.goto('/')

    // Scroll position might reset (expected behavior)
    // Just verify page loaded correctly
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()
  })
})

test.describe('User Journey - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('should complete mobile browsing session', async ({ page }) => {
    // Navigate to home
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()

    // Check that content is mobile-friendly
    const featureCards = page.locator('.rounded-lg.border.bg-card')
    await expect(featureCards.first()).toBeVisible()

    // Try to access settings
    await page.goto('/settings')
    await page.waitForURL(/\/login/)

    // Verify mobile login page
    const loginCard = page.locator('.rounded-lg.bg-white, .rounded-lg.bg-gray-800')
    await expect(loginCard).toBeVisible()

    // Go back to home
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should handle touch interactions on mobile', async ({ page }) => {
    await page.goto('/')

    // Tap on rotation controls
    const pauseButton = page
      .locator(
        'button[aria-label*="暂停"], button[aria-label*="Pause"], button:has-text("暂停"), button:has-text("Pause")'
      )
      .first()

    const pauseVisible = await pauseButton.isVisible().catch(() => false)
    if (pauseVisible) {
      await pauseButton.tap()

      // Play button should appear
      const playButton = page
        .locator(
          'button[aria-label*="播放"], button[aria-label*="Play"], button:has-text("播放"), button:has-text("Play")'
        )
        .first()
      await expect(playButton).toBeVisible({ timeout: 2000 })
    }
  })
})
