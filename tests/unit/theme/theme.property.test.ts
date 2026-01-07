/**
 * Property-Based Tests for UI Theme Optimization
 * Feature: ui-theme-optimization
 *
 * These tests validate the correctness properties defined in the design document
 * using property-based testing with fast-check.
 */

import { describe, it, expect } from 'vitest'
import { fc, test } from '@fast-check/vitest'
import {
  hslToRgb,
  getContrastRatio,
  parseHslString,
  meetsWcagAA,
} from '@/lib/utils/color'

/**
 * Theme color tokens as defined in globals.css
 * These represent the actual HSL values from the CSS variables
 */
const lightModeTokens = {
  background: '210 40% 98%',
  foreground: '222.2 84% 4.9%',
  card: '0 0% 100%',
  cardForeground: '222.2 84% 4.9%',
  popover: '0 0% 100%',
  popoverForeground: '222.2 84% 4.9%',
  primary: '160 84% 39%',
  primaryForeground: '0 0% 100%',
  secondary: '217 91% 60%',
  secondaryForeground: '0 0% 100%',
  muted: '210 40% 96%',
  mutedForeground: '215 16% 47%',
  accent: '210 40% 96%',
  accentForeground: '222.2 47% 11%',
  destructive: '0 84.2% 60.2%',
  destructiveForeground: '210 40% 98%',
  border: '214 32% 91%',
  input: '214 32% 91%',
  ring: '160 84% 39%',
}

const darkModeTokens = {
  background: '222 84% 5%',
  foreground: '210 40% 98%',
  card: '217 33% 17%',
  cardForeground: '210 40% 98%',
  popover: '217 33% 17%',
  popoverForeground: '210 40% 98%',
  primary: '160 84% 45%',
  primaryForeground: '222 84% 5%',
  secondary: '217 91% 65%',
  secondaryForeground: '222 84% 5%',
  muted: '217 33% 17%',
  mutedForeground: '215 20% 65%',
  accent: '217 33% 17%',
  accentForeground: '210 40% 98%',
  destructive: '0 62.8% 30.6%',
  destructiveForeground: '210 40% 98%',
  border: '217 33% 25%',
  input: '217 33% 25%',
  ring: '160 84% 45%',
}

/**
 * Helper function to convert HSL token to RGB
 */
function tokenToRgb(hslString: string): [number, number, number] {
  const [h, s, l] = parseHslString(hslString)
  return hslToRgb(h, s, l)
}

/**
 * Text/background color pairs that must meet WCAG AA contrast requirements
 */
const textBackgroundPairs = [
  { text: 'foreground', bg: 'background', name: 'Main text on background' },
  { text: 'cardForeground', bg: 'card', name: 'Card text on card' },
  { text: 'primaryForeground', bg: 'primary', name: 'Primary button text' },
  { text: 'secondaryForeground', bg: 'secondary', name: 'Secondary button text' },
  { text: 'mutedForeground', bg: 'background', name: 'Muted text on background' },
  { text: 'accentForeground', bg: 'accent', name: 'Accent text on accent' },
  { text: 'destructiveForeground', bg: 'destructive', name: 'Destructive button text' },
]

describe('Theme Property Tests', () => {
  /**
   * Property 1: WCAG Contrast Ratio Compliance
   * Feature: ui-theme-optimization, Property 1: WCAG Contrast Ratio Compliance
   *
   * *For any* text color and background color combination defined in the Theme_System
   * (both light and dark modes), the contrast ratio SHALL be at least 4.5:1 for normal text
   * and 3:1 for large text, ensuring WCAG AA compliance.
   *
   * **Validates: Requirements 1.6, 4.2, 8.1**
   */
  describe('Property 1: WCAG Contrast Ratio Compliance', () => {
    describe('Light Mode', () => {
      textBackgroundPairs.forEach(({ text, bg, name }) => {
        it(`${name} meets WCAG AA (4.5:1 minimum)`, () => {
          const textColor = tokenToRgb(lightModeTokens[text as keyof typeof lightModeTokens])
          const bgColor = tokenToRgb(lightModeTokens[bg as keyof typeof lightModeTokens])
          const ratio = getContrastRatio(textColor, bgColor)

          expect(
            meetsWcagAA(ratio),
            `Contrast ratio ${ratio.toFixed(2)}:1 for "${name}" does not meet WCAG AA (4.5:1)`
          ).toBe(true)
        })
      })
    })

    describe('Dark Mode', () => {
      textBackgroundPairs.forEach(({ text, bg, name }) => {
        it(`${name} meets WCAG AA (4.5:1 minimum)`, () => {
          const textColor = tokenToRgb(darkModeTokens[text as keyof typeof darkModeTokens])
          const bgColor = tokenToRgb(darkModeTokens[bg as keyof typeof darkModeTokens])
          const ratio = getContrastRatio(textColor, bgColor)

          expect(
            meetsWcagAA(ratio),
            `Contrast ratio ${ratio.toFixed(2)}:1 for "${name}" does not meet WCAG AA (4.5:1)`
          ).toBe(true)
        })
      })
    })

    /**
     * Property-based test: For any valid HSL color pair where one is significantly
     * lighter than the other, the contrast calculation should be consistent
     */
    test.prop(
      [
        fc.integer({ min: 0, max: 360 }), // hue1
        fc.integer({ min: 0, max: 100 }), // saturation1
        fc.integer({ min: 0, max: 30 }), // lightness1 (dark)
        fc.integer({ min: 0, max: 360 }), // hue2
        fc.integer({ min: 0, max: 100 }), // saturation2
        fc.integer({ min: 70, max: 100 }), // lightness2 (light)
      ],
      { numRuns: 100 }
    )(
      'contrast ratio is always >= 1 for any color pair',
      (h1, s1, l1, h2, s2, l2) => {
        const color1 = hslToRgb(h1, s1, l1)
        const color2 = hslToRgb(h2, s2, l2)
        const ratio = getContrastRatio(color1, color2)

        // Contrast ratio is always at least 1:1 (same color)
        expect(ratio).toBeGreaterThanOrEqual(1)
        // Contrast ratio cannot exceed 21:1 (black on white)
        expect(ratio).toBeLessThanOrEqual(21)
      }
    )

    /**
     * Property-based test: Contrast ratio is symmetric
     */
    test.prop(
      [
        fc.integer({ min: 0, max: 360 }),
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 0, max: 360 }),
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 0, max: 100 }),
      ],
      { numRuns: 100 }
    )(
      'contrast ratio is symmetric (order of colors does not matter)',
      (h1, s1, l1, h2, s2, l2) => {
        const color1 = hslToRgb(h1, s1, l1)
        const color2 = hslToRgb(h2, s2, l2)

        const ratio1 = getContrastRatio(color1, color2)
        const ratio2 = getContrastRatio(color2, color1)

        expect(ratio1).toBeCloseTo(ratio2, 10)
      }
    )
  })

  /**
   * Property 2: Theme Consistency
   * Feature: ui-theme-optimization, Property 2: Theme Consistency
   *
   * *For any* color token defined in the light mode theme, there SHALL exist
   * a corresponding token in the dark mode theme with appropriate contrast adjustments.
   *
   * **Validates: Requirements 1.4, 1.5, 8.2, 8.3**
   */
  describe('Property 2: Theme Consistency', () => {
    const lightModeKeys = Object.keys(lightModeTokens) as (keyof typeof lightModeTokens)[]
    const darkModeKeys = Object.keys(darkModeTokens) as (keyof typeof darkModeTokens)[]

    it('all light mode tokens have corresponding dark mode tokens', () => {
      lightModeKeys.forEach((key) => {
        expect(
          darkModeKeys.includes(key),
          `Light mode token "${key}" is missing in dark mode`
        ).toBe(true)
      })
    })

    it('all dark mode tokens have corresponding light mode tokens', () => {
      darkModeKeys.forEach((key) => {
        expect(
          lightModeKeys.includes(key),
          `Dark mode token "${key}" is missing in light mode`
        ).toBe(true)
      })
    })

    it('light and dark mode have the same number of tokens', () => {
      expect(lightModeKeys.length).toBe(darkModeKeys.length)
    })

    /**
     * Property-based test: For any token name that exists in both themes,
     * the HSL values should be valid (parseable)
     */
    test.prop([fc.constantFrom(...lightModeKeys)], { numRuns: 100 })(
      'all token values are valid HSL strings',
      (tokenKey) => {
        const lightValue = lightModeTokens[tokenKey]
        const darkValue = darkModeTokens[tokenKey]

        // Both should be parseable
        const lightHsl = parseHslString(lightValue)
        const darkHsl = parseHslString(darkValue)

        // HSL values should be in valid ranges
        expect(lightHsl[0]).toBeGreaterThanOrEqual(0)
        expect(lightHsl[0]).toBeLessThanOrEqual(360)
        expect(lightHsl[1]).toBeGreaterThanOrEqual(0)
        expect(lightHsl[1]).toBeLessThanOrEqual(100)
        expect(lightHsl[2]).toBeGreaterThanOrEqual(0)
        expect(lightHsl[2]).toBeLessThanOrEqual(100)

        expect(darkHsl[0]).toBeGreaterThanOrEqual(0)
        expect(darkHsl[0]).toBeLessThanOrEqual(360)
        expect(darkHsl[1]).toBeGreaterThanOrEqual(0)
        expect(darkHsl[1]).toBeLessThanOrEqual(100)
        expect(darkHsl[2]).toBeGreaterThanOrEqual(0)
        expect(darkHsl[2]).toBeLessThanOrEqual(100)
      }
    )

    /**
     * Property: Background tokens should have inverted lightness between modes
     * Light mode backgrounds should be light, dark mode backgrounds should be dark
     */
    describe('background lightness inversion', () => {
      const backgroundTokens = ['background', 'card', 'popover', 'muted', 'accent'] as const

      backgroundTokens.forEach((token) => {
        it(`${token} has appropriate lightness for each mode`, () => {
          const lightHsl = parseHslString(lightModeTokens[token as keyof typeof lightModeTokens])
          const darkHsl = parseHslString(darkModeTokens[token as keyof typeof darkModeTokens])

          // Light mode backgrounds should be light (L > 50%)
          expect(
            lightHsl[2],
            `Light mode ${token} should have lightness > 50%, got ${lightHsl[2]}%`
          ).toBeGreaterThan(50)

          // Dark mode backgrounds should be dark (L < 50%)
          expect(
            darkHsl[2],
            `Dark mode ${token} should have lightness < 50%, got ${darkHsl[2]}%`
          ).toBeLessThan(50)
        })
      })
    })

    /**
     * Property: Foreground tokens should have inverted lightness between modes
     * Light mode foregrounds should be dark, dark mode foregrounds should be light
     */
    describe('foreground lightness inversion', () => {
      const foregroundTokens = [
        'foreground',
        'cardForeground',
        'accentForeground',
      ] as const

      foregroundTokens.forEach((token) => {
        it(`${token} has appropriate lightness for each mode`, () => {
          const lightHsl = parseHslString(lightModeTokens[token as keyof typeof lightModeTokens])
          const darkHsl = parseHslString(darkModeTokens[token as keyof typeof darkModeTokens])

          // Light mode foregrounds should be dark (L < 50%)
          expect(
            lightHsl[2],
            `Light mode ${token} should have lightness < 50%, got ${lightHsl[2]}%`
          ).toBeLessThan(50)

          // Dark mode foregrounds should be light (L > 50%)
          expect(
            darkHsl[2],
            `Dark mode ${token} should have lightness > 50%, got ${darkHsl[2]}%`
          ).toBeGreaterThan(50)
        })
      })
    })

    /**
     * Property: Border visibility in dark mode
     * Dark mode borders should be visible (lighter than background)
     */
    it('dark mode border is visible against background', () => {
      const bgHsl = parseHslString(darkModeTokens.background)
      const borderHsl = parseHslString(darkModeTokens.border as string)

      // Border should be lighter than background in dark mode
      expect(
        borderHsl[2],
        `Dark mode border (L=${borderHsl[2]}%) should be lighter than background (L=${bgHsl[2]}%)`
      ).toBeGreaterThan(bgHsl[2])
    })

    /**
     * Property: Card elevation in dark mode
     * Dark mode cards should be slightly elevated (lighter than background)
     */
    it('dark mode card is elevated above background', () => {
      const bgHsl = parseHslString(darkModeTokens.background)
      const cardHsl = parseHslString(darkModeTokens.card)

      // Card should be lighter than background in dark mode
      expect(
        cardHsl[2],
        `Dark mode card (L=${cardHsl[2]}%) should be lighter than background (L=${bgHsl[2]}%)`
      ).toBeGreaterThan(bgHsl[2])
    })
  })
})
