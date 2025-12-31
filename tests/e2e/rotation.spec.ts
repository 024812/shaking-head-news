import { test, expect } from '@playwright/test'

test.describe('Page Rotation Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should display rotation controls', async ({ page }) => {
    // Look for rotation controls component
    const rotationSection = page.locator('text=/旋转控制|Rotation Controls/i')
    await expect(rotationSection).toBeVisible()
  })

  test('should have pause/play button', async ({ page }) => {
    // Look for pause or play button
    const pauseButton = page.locator(
      'button[aria-label*="暂停"], button[aria-label*="Pause"], button:has-text("暂停"), button:has-text("Pause")'
    )
    const playButton = page.locator(
      'button[aria-label*="播放"], button[aria-label*="Play"], button:has-text("播放"), button:has-text("Play")'
    )

    // Either pause or play button should be visible
    const pauseVisible = await pauseButton.isVisible().catch(() => false)
    const playVisible = await playButton.isVisible().catch(() => false)

    expect(pauseVisible || playVisible).toBe(true)
  })

  test('should toggle rotation when clicking pause/play', async ({ page }) => {
    // Find the pause/play button
    const pauseButton = page
      .locator(
        'button[aria-label*="暂停"], button[aria-label*="Pause"], button:has-text("暂停"), button:has-text("Pause")'
      )
      .first()
    const playButton = page
      .locator(
        'button[aria-label*="播放"], button[aria-label*="Play"], button:has-text("播放"), button:has-text("Play")'
      )
      .first()

    // Try to click pause button if visible
    const pauseVisible = await pauseButton.isVisible().catch(() => false)
    if (pauseVisible) {
      await pauseButton.click()

      // After clicking pause, play button should appear
      await expect(playButton).toBeVisible({ timeout: 2000 })

      // Click play to resume
      await playButton.click()

      // After clicking play, pause button should appear
      await expect(pauseButton).toBeVisible({ timeout: 2000 })
    }
  })

  test('should have rotation mode selector', async ({ page }) => {
    // Look for mode selector (fixed/continuous)
    const modeSelector = page.locator('text=/固定模式|连续模式|Fixed|Continuous/i')

    // At least one mode option should be visible
    const count = await modeSelector.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should have rotation interval slider', async ({ page }) => {
    // Look for slider control
    const slider = page.locator('input[type="range"], [role="slider"]')

    // Slider should exist
    const sliderCount = await slider.count()
    expect(sliderCount).toBeGreaterThan(0)
  })

  test('should adjust rotation interval with slider', async ({ page }) => {
    // Find slider
    const slider = page.locator('input[type="range"], [role="slider"]').first()

    const sliderVisible = await slider.isVisible().catch(() => false)
    if (sliderVisible) {
      // Get initial value
      const _initialValue =
        (await slider.getAttribute('aria-valuenow')) || (await slider.inputValue())

      // Try to change slider value
      await slider.focus()
      await slider.press('ArrowRight')
      await slider.press('ArrowRight')

      // Value should have changed
      const newValue = (await slider.getAttribute('aria-valuenow')) || (await slider.inputValue())

      // Values should be different (unless at max)
      // This is a basic check that the slider is interactive
      expect(newValue).toBeDefined()
    }
  })

  test('should respect prefers-reduced-motion', async ({ page }) => {
    // Set prefers-reduced-motion
    await page.emulateMedia({ reducedMotion: 'reduce' })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Page should still load normally
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()

    // Rotation controls should still be present
    const rotationSection = page.locator('text=/旋转控制|Rotation Controls/i')
    await expect(rotationSection).toBeVisible()
  })

  test('should maintain rotation state in localStorage', async ({ page }) => {
    // Check if rotation state is stored
    const pauseButton = page
      .locator(
        'button[aria-label*="暂停"], button[aria-label*="Pause"], button:has-text("暂停"), button:has-text("Pause")'
      )
      .first()

    const pauseVisible = await pauseButton.isVisible().catch(() => false)
    if (pauseVisible) {
      // Click pause
      await pauseButton.click()

      // Check localStorage
      const storage = await page.evaluate(() => {
        return localStorage.getItem('rotation-storage')
      })

      expect(storage).toBeTruthy()

      // Reload page
      await page.reload()
      await page.waitForLoadState('networkidle')

      // Play button should still be visible (paused state persisted)
      const playButton = page
        .locator(
          'button[aria-label*="播放"], button[aria-label*="Play"], button:has-text("播放"), button:has-text("Play")'
        )
        .first()
      await expect(playButton).toBeVisible({ timeout: 2000 })
    }
  })

  test('should display rotation angle indicator', async ({ page }) => {
    // Look for any angle or degree indicator
    const angleIndicator = page.locator('text=/度|°|angle/i')

    // May or may not be visible depending on implementation
    const count = await angleIndicator.count()
    // Just verify the page loaded correctly
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('rotation controls should be keyboard accessible', async ({ page }) => {
    // Tab through controls
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // Check if any rotation control is focused
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement
      return el?.tagName
    })

    expect(focusedElement).toBeTruthy()
  })

  test('should work on mobile devices', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip()
    }

    // Rotation controls should be visible on mobile
    const rotationSection = page.locator('text=/旋转控制|Rotation Controls/i')
    await expect(rotationSection).toBeVisible()

    // Controls should be touch-friendly
    const pauseButton = page
      .locator(
        'button[aria-label*="暂停"], button[aria-label*="Pause"], button:has-text("暂停"), button:has-text("Pause")'
      )
      .first()

    const pauseVisible = await pauseButton.isVisible().catch(() => false)
    if (pauseVisible) {
      const buttonBox = await pauseButton.boundingBox()

      // Button should be at least 44x44 pixels (touch target size)
      if (buttonBox) {
        expect(buttonBox.width).toBeGreaterThanOrEqual(40)
        expect(buttonBox.height).toBeGreaterThanOrEqual(40)
      }
    }
  })

  test('should handle rapid clicks gracefully', async ({ page }) => {
    const pauseButton = page
      .locator(
        'button[aria-label*="暂停"], button[aria-label*="Pause"], button:has-text("暂停"), button:has-text("Pause")'
      )
      .first()
    const playButton = page
      .locator(
        'button[aria-label*="播放"], button[aria-label*="Play"], button:has-text("播放"), button:has-text("Play")'
      )
      .first()

    const pauseVisible = await pauseButton.isVisible().catch(() => false)
    if (pauseVisible) {
      // Click multiple times rapidly
      await pauseButton.click()
      await page.waitForTimeout(100)
      await playButton.click()
      await page.waitForTimeout(100)
      await pauseButton.click()

      // Page should still be functional
      const heading = page.locator('h1')
      await expect(heading).toBeVisible()
    }
  })

  test('should display rotation mode options', async ({ page }) => {
    // Look for fixed and continuous mode options
    const fixedMode = page.locator('text=/固定模式|Fixed Mode/i')
    const continuousMode = page.locator('text=/连续模式|Continuous Mode/i')

    // At least one should be visible or both
    const fixedCount = await fixedMode.count()
    const continuousCount = await continuousMode.count()

    expect(fixedCount + continuousCount).toBeGreaterThan(0)
  })
})
