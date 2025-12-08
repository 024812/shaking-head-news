# Testing Setup Documentation

## Overview

This document describes the testing infrastructure setup for the Shaking Head News application.

## Completed Setup

### 1. Vitest Configuration

**File**: `vitest.config.ts`

- **Test Environment**: jsdom (for DOM testing)
- **Globals**: Enabled (no need to import `describe`, `it`, `expect`)
- **Setup Files**: `./tests/setup.ts`
- **Include Pattern**: `tests/**/*.{test,spec}.{ts,tsx}`
- **Exclude**: `node_modules`, `.next`, `tests/e2e/**`
- **Coverage**: v8 provider with text, json, and html reporters
- **Path Alias**: `@` resolves to project root

### 2. Playwright Configuration

**File**: `playwright.config.ts`

- **Test Directory**: `./tests/e2e`
- **Parallel Execution**: Enabled
- **Retries**: 2 on CI, 0 locally
- **Base URL**: `http://localhost:3000` (configurable via `PLAYWRIGHT_TEST_BASE_URL`)
- **Trace**: On first retry
- **Screenshot**: On failure only
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Web Server**: Automatically starts dev server before tests

### 3. Test Setup File

**File**: `tests/setup.ts`

- Imports `@testing-library/jest-dom` for DOM matchers
- Configures automatic cleanup after each test
- Sets up global test utilities

### 4. Test Utilities

**File**: `tests/utils/test-utils.tsx`

Provides helpful utilities for testing:

- `renderWithProviders`: Custom render function
- `mockSession`: Mock authenticated user session
- `mockUserSettings`: Mock user settings data
- `mockNewsItems`: Mock news data
- `mockRSSSources`: Mock RSS sources
- `mockUserStats`: Mock statistics data
- `createMockResponse`: Create mock fetch responses
- Re-exports all Testing Library utilities

### 5. Directory Structure

```
tests/
├── setup.ts                    # Global test setup
├── utils/
│   └── test-utils.tsx         # Testing utilities and mocks
├── unit/                      # Unit tests
│   ├── .gitkeep
│   └── example.test.ts        # Example unit test
├── integration/               # Integration tests
│   └── .gitkeep
└── e2e/                       # E2E tests
    ├── .gitkeep
    └── example.spec.ts        # Example E2E test
```

### 6. NPM Scripts

Added the following test scripts to `package.json`:

```json
{
  "test": "vitest --run",
  "test:watch": "vitest",
  "test:coverage": "vitest --run --coverage",
  "test:ui": "vitest --ui",
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "test:e2e:headed": "playwright test --headed",
  "test:e2e:debug": "playwright test --debug"
}
```

### 7. Dependencies

All required testing dependencies are already installed:

- `vitest`: ^2.1.8
- `@vitejs/plugin-react`: ^4.3.4
- `@testing-library/react`: ^16.1.0
- `@testing-library/jest-dom`: ^6.6.3
- `@playwright/test`: ^1.49.1
- `jsdom`: Auto-installed by Vitest

## Usage

### Running Unit Tests

```bash
# Run all tests once
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode (see browser)
npm run test:e2e:headed

# Debug E2E tests
npm run test:e2e:debug
```

## Verification

The setup has been verified with:

1. **Example Unit Test** (`tests/unit/example.test.ts`):
   - ✓ Basic arithmetic test
   - ✓ String operations test
   - ✓ Array operations test

2. **Example E2E Test** (`tests/e2e/example.spec.ts`):
   - Homepage loading test
   - Header visibility test

## Next Steps

The testing infrastructure is now ready for implementing the optional test tasks:

- **Task 17.1**: Write Server Actions unit tests
- **Task 17.2**: Write component unit tests
- **Task 17.3**: Write E2E tests

## Notes

- The setup file is minimal to avoid complex mocking issues
- Mocks for Next.js features, next-intl, next-themes, and framer-motion can be added as needed in individual test files
- The test utilities file provides common mock data for consistent testing
- Coverage reports will be generated in the `coverage/` directory
- Playwright reports will be generated in the `playwright-report/` directory

## Troubleshooting

### Common Issues

1. **Tests not found**: Ensure test files match the pattern `tests/**/*.{test,spec}.{ts,tsx}`
2. **Module resolution errors**: Check the path alias configuration in `vitest.config.ts`
3. **E2E tests failing**: Ensure the dev server is running or let Playwright start it automatically
4. **Coverage not working**: Install `@vitest/coverage-v8` if needed

### Windows-Specific Notes

- File paths use forward slashes in configuration
- The setup has been tested and verified on Windows
- Long file paths should not be an issue with the current structure

## References

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library Jest-DOM](https://github.com/testing-library/jest-dom)
