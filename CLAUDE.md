# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Shaking Head News is a browser extension built with Vue 3 and TypeScript that promotes neck health by rotating news content. It serves as a new tab replacement for Chrome/Firefox browsers and can also be deployed as a web application. The extension features dual deployment capability, intelligent caching, and respects system accessibility preferences.

## Development Commands

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Production build with TypeScript compilation
npm run watch        # Watch mode for development
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint and Stylelint checks
npm run lint:fix     # Auto-fix linting issues

# Deployment
npm run deploy       # Build and deploy to GitHub Pages
npm run supabase:functions:deploy  # Deploy serverless functions
```

## Architecture Overview

### Core Architecture Pattern
- **Framework**: Vue 3 with Composition API and TypeScript
- **State Management**: Vue's reactivity system (no external state library)
- **Build System**: Vite with custom manifest generation for browser extensions
- **Styling**: SCSS with modular, component-scoped styles

### Key Directories

```
src/
├── components/          # Vue UI components
│   ├── SettingsMenu.vue     # Main settings interface with tabbed navigation
│   ├── ContentView.vue      # Main content display with rotation logic
│   ├── TabNavigator.vue     # Reusable tab component
│   └── [UI Components]      # Slider, ToggleSwitch, StyledDropdown, Badge
├── composables/         # Business logic composables
│   ├── useMode.ts           # Core rotation logic and modes
│   ├── useRssFeeds.ts       # RSS feed management
│   ├── useEverydayNews.ts   # News data fetching
│   ├── useMotionPreferences.ts # Accessibility features
│   └── useNewsCache.ts      # Caching system
├── services/           # API and data services
├── helpers/            # Utility functions (storage.ts is key)
└── types.ts            # TypeScript definitions
```

### Component Architecture

**Main Components:**
- `App.vue`: Root component integrating content view and settings
- `ContentView.vue`: Handles rotation transformations and content display
- `SettingsMenu.vue`: Comprehensive settings with tabbed interface

**UI Component Library:**
- `Slider.vue`: Range input with visual feedback and time formatting
- `ToggleSwitch.vue`: Animated toggle for boolean settings
- `StyledDropdown.vue`: Custom dropdown with click-outside handling
- `Badge.vue`: Removable items with multiple variants
- `TabNavigator.vue`: Reusable tabbed navigation

### Service Layer

**Storage Helper** (`src/helpers/storage.ts`):
- Abstracts Chrome extension storage API
- Provides localStorage fallback for web deployment
- Promise-based interface with type safety

**ApiService** (`src/services/ApiService.ts`):
- Base HTTP service with centralized error handling
- Request/response interception
- Used by all data-fetching services

**CacheManager** (`src/services/CacheManager.ts`):
- TTL-based cache expiration
- Size limits and automatic cleanup
- Performance statistics tracking

### Business Logic Composables

**useMode.ts** - Core Features:
- Manages two rotation modes: Continuous and Soft
- Handles motion preferences and accessibility
- Integrates with system's "reduce motion" setting
- Storage persistence for user preferences

**useRssFeeds.ts** - Feed Management:
- CRUD operations for RSS feeds
- Feed validation and testing
- Active feed selection with persistence
- Error handling for failed feeds

**useEverydayNews.ts** - News Data:
- Fetches news from multiple sources
- Date-based content retrieval
- Fallback mechanisms for failed requests
- Integration with caching system

### Key Features

1. **Dual Deployment**: Works as browser extension OR web app
2. **Accessibility**: Respects system motion preferences
3. **Offline Support**: Intelligent caching with TTL
4. **Internationalization**: Chinese language support with i18n structure
5. **Data Management**: Import/export settings functionality

### Styling System

- **Variables**: Defined in `src/variables.scss`
- **Scoping**: All component styles are scoped
- **Theme**: Consistent color palette with accessibility considerations
- **Responsive**: Mobile-first design approach

### Browser Extension Specifics

- **Manifest V3**: Configuration in `manifest.config.ts`
- **Permissions**: Only requires 'storage' permission
- **New Tab Override**: Replaces browser's new tab page
- **Cross-Browser**: Chrome and Firefox support

### Development Notes

- **Type Safety**: Comprehensive TypeScript implementation
- **Component Communication**: Primarily through props/emits, some provide/inject
- **Error Boundaries**: Graceful fallbacks for failed data requests
- **Performance**: Lazy loading and efficient caching strategies
- **Testing Ready**: Composables and services designed for testability

### Important Patterns

1. **Composables First**: Business logic lives in composables, not components
2. **Service Layer**: All external API calls go through service classes
3. **Storage Abstraction**: Never directly access chrome.storage, use the helper
4. **Error Handling**: Consistent error propagation with user-friendly messages
5. **Accessibility**: Always consider motion preferences and screen readers

### Code Style and Linting

- **ESLint Configuration**: Flat config with TypeScript, Vue, and Prettier integration
- **Naming Conventions**:
  - Components: PascalCase (e.g., `SettingsMenu.vue`)
  - Composables: camelCase with `use` prefix (e.g., `useMode.ts`)
  - Services: PascalCase (e.g., `ApiService.ts`)
  - Interfaces: PascalCase with `I` prefix (e.g., `INewsItem`)
  - Type Parameters: PascalCase with `T` prefix (e.g., `TData`)
- **File Naming**: Enforced by ESLint rules in `eslint.config.js`
- **No Index Files**: ESLint prevents `index.ts` files to maintain explicit imports

### Build System

- **Vite Configuration**: Custom manifest generation via `scripts/build-manifest.ts`
- **Output Format**: ES modules for modern browser support
- **Chunk Size**: Warning limit set to 4096KB for browser extension compatibility
- **Banner**: Automatically adds author attribution to built files