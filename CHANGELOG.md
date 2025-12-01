# Changelog

All notable changes to Shaking Head News will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2025-12-01

### Changed

- **Tech Stack Upgrade**: Upgraded to Next.js 16.0.6, React 19.2.0, and Tailwind CSS 4.1.17
- **Rotation Enhancement**: Increased minimum rotation angle from 5-10 degrees to 8-25 degrees for improved shaking effect visibility
- **Configuration**: Removed deprecated `experimental.serverActions` config (now enabled by default in Next.js 16)

### Fixed

- **Next.js 16 Compatibility**: Updated `revalidateTag` calls to include required second parameter `{ expire: 0 }`
- **Build Configuration**: Removed ignored `memory` setting from `vercel.json`
- **Node Version**: Updated to Node.js 22.x for Vercel deployment consistency

## [2.0.0] - 2025-11-13

### Major Rewrite

Complete rewrite from Vue 3 browser extension to Next.js 15 web application.

### Added

- **Modern Tech Stack**: Next.js 16, React 19, TypeScript
- **User Authentication**: Google OAuth via NextAuth.js
- **Cloud Sync**: Settings sync via Upstash Redis
- **RSS Management**: Add, manage, and export custom RSS feeds
- **Statistics Dashboard**: Track rotation activity with charts
- **Health Reminders**: Browser notifications for neck health
- **Internationalization**: Full Chinese and English support
- **Theme Support**: Light, dark, and system theme modes
- **Responsive Design**: Mobile-first, works on all devices
- **Performance**: ISR caching, optimized images, code splitting
- **Security**: Rate limiting, input validation, CSP headers
- **Testing**: Unit tests (Vitest), E2E tests (Playwright)
- **CI/CD**: GitHub Actions workflow
- **Monitoring**: Logging and analytics integration

### Changed

- Migrated from browser extension to web application
- Replaced Pinia with Zustand for state management
- Replaced Vue Router with Next.js App Router
- Replaced Vite with Turbopack
- Improved UI with Tailwind CSS 4 and Shadcn/ui
- Enhanced accessibility features

### Removed

- Browser extension functionality (now web-only)
- Local-only storage (now supports cloud sync)

## [1.x.x] - Previous Versions

See the original [WAI project](https://github.com/dukeluo/wai) for version 1.x changelog.

---

## Credits

This project is based on the excellent [WAI](https://github.com/dukeluo/wai) project by [@dukeluo](https://github.com/dukeluo).
