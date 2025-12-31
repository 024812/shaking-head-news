import { test, expect } from '@playwright/test'

test.describe('News Browsing Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display the homepage with title and features', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/摇头看新闻|Shaking Head News/)

    // Check main heading is visible
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()
    await expect(heading).toContainText(/摇头看新闻|Shaking Head News/)

    // Check subtitle is visible
    const subtitle = page.locator('p.text-lg.text-muted-foreground').first()
    await expect(subtitle).toBeVisible()
  })

  test('should display feature cards', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Check that feature cards are displayed
    const featureCards = page.locator('.rounded-lg.border.bg-card')
    await expect(featureCards).toHaveCount(6)

    // Check that each card has a title and description
    const firstCard = featureCards.first()
    await expect(firstCard.locator('h3')).toBeVisible()
    await expect(firstCard.locator('p')).toBeVisible()
  })

  test('should have a visible header with navigation', async ({ page }) => {
    const header = page.locator('header')
    await expect(header).toBeVisible()

    // Check for navigation links
    const nav = header.locator('nav')
    await expect(nav).toBeVisible()
  })

  test('should have a visible footer', async ({ page }) => {
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()
  })

  test('should display rotation controls', async ({ page }) => {
    // Check that rotation controls are visible
    const rotationControls = page.locator('text=/旋转控制|Rotation Controls/i')
    await expect(rotationControls).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip()
    }

    // Check that the page is responsive
    await page.waitForLoadState('networkidle')

    // Check that feature cards stack vertically on mobile
    const featureCards = page.locator('.rounded-lg.border.bg-card')
    const firstCard = featureCards.first()
    const secondCard = featureCards.nth(1)

    const firstBox = await firstCard.boundingBox()
    const secondBox = await secondCard.boundingBox()

    // On mobile, cards should stack (second card should be below first)
    if (firstBox && secondBox) {
      expect(secondBox.y).toBeGreaterThan(firstBox.y)
    }
  })

  test('should navigate to settings page', async ({ page }) => {
    // Click on settings link in navigation
    await page.click('a[href="/settings"]')

    // Should redirect to login if not authenticated
    await page.waitForURL(/\/login/)
    await expect(page).toHaveURL(/\/login/)
  })

  test('should navigate to stats page', async ({ page }) => {
    // Click on stats link in navigation
    await page.click('a[href="/stats"]')

    // Should redirect to login if not authenticated
    await page.waitForURL(/\/login/)
    await expect(page).toHaveURL(/\/login/)
  })

  test('should navigate to RSS page', async ({ page }) => {
    // Click on RSS link in navigation
    await page.click('a[href="/rss"]')

    // Should redirect to login if not authenticated
    await page.waitForURL(/\/login/)
    await expect(page).toHaveURL(/\/login/)
  })

  test('should have accessible content', async ({ page }) => {
    // Check for proper heading hierarchy
    const h1 = page.locator('h1')
    await expect(h1).toHaveCount(1)

    // Check for alt text on images (if any)
    const images = page.locator('img')
    const imageCount = await images.count()

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i)
      const alt = await img.getAttribute('alt')
      expect(alt).toBeTruthy()
    }
  })

  test('should load without console errors', async ({ page }) => {
    const errors: string[] = []

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Filter out known acceptable errors (like network errors in dev)
    const criticalErrors = errors.filter(
      (error) => !error.includes('favicon') && !error.includes('net::ERR')
    )

    expect(criticalErrors).toHaveLength(0)
  })
})
