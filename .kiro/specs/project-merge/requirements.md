# Requirements Document

## Introduction

本规范定义了将 shaking-news 和 shaking-head-news 两个项目合并为一个统一代码库的需求。系统采用三层用户模式：访客模式（即开即用）、会员模式（免费登录解锁）、Pro 模式（付费高级功能，未来实现）。

## Glossary

- **Unified_Codebase**: 合并后的统一代码库，基于当前项目
- **Guest_Mode**: 访客模式，即开即用，无需登录，使用默认设置
- **Member_Mode**: 会员模式，免费登录后解锁，可自定义设置
- **Pro_Mode**: Pro 模式，付费订阅（未来），解锁高级功能如统计、提醒
- **Guest_User**: 未登录用户，使用访客模式
- **Member_User**: 已登录免费用户，使用会员模式
- **Pro_User**: 付费订阅用户，使用 Pro 模式

## Requirements

### Requirement 1: 统一代码库架构

**User Story:** As a developer, I want a single codebase where features are controlled by user tier, so that I can maintain one project with flexible monetization options.

#### Acceptance Criteria

1. THE Unified_Codebase SHALL support three user tiers: Guest, Member, and Pro
2. THE System SHALL determine feature availability based on user authentication and subscription status
3. WHEN a user is not logged in (Guest_User), THE System SHALL show Guest_Mode features only
4. WHEN a user is logged in without subscription (Member_User), THE System SHALL enable Member_Mode features
5. WHEN a user has an active Pro subscription (Pro_User), THE System SHALL enable all Pro_Mode features
6. THE Unified_Codebase SHALL support deployment to any platform (Vercel, Azure, etc.)

### Requirement 2: 访客模式功能集 (Guest Mode - 未登录用户)

**User Story:** As a casual visitor, I want to use the app immediately without registration, so that I can quickly start reading news and exercising my neck.

#### Acceptance Criteria

1. THE Guest_Mode SHALL work immediately without any login requirement
2. THE Guest_Mode SHALL display default news sources only (no customization)
3. THE Guest_Mode SHALL use fixed default settings:
   - Rotation mode: Continuous
   - Rotation interval: 30 seconds
   - Tilt angle: 15 degrees
   - Font size: Medium
4. THE Guest_Mode SHALL NOT allow users to modify rotation settings
5. THE Guest_Mode SHALL display AdSense advertisements (cannot be disabled)
6. THE Guest_Mode SHALL support bilingual interface switching (Chinese/English)
7. THE Guest_Mode SHALL support manual dark/light mode switching
8. THE Guest_Mode SHALL allow users to pause/resume rotation (but not adjust parameters)
9. THE Guest_Mode SHALL show a "Login to unlock more features" prompt in the UI
10. THE Guest_Mode SHALL display session rotation count with "Login to save your progress" message

### Requirement 3: 会员模式功能集 (Member Mode - 免费登录用户)

**User Story:** As a registered member, I want to customize my reading experience and save my settings, so that I can have a personalized experience across devices.

#### Acceptance Criteria

1. THE Member_Mode SHALL require user authentication (Google, Microsoft, or local account)
2. THE Member_Mode SHALL allow customization of rotation settings:
   - Rotation mode: Fixed or Continuous
   - Rotation interval: 5-60 seconds
   - Tilt angle: 8-25 degrees
   - Font size: Small/Medium/Large/Extra Large
   - Layout mode: Compact/Normal
3. THE Member_Mode SHALL allow custom RSS source management (add/remove/switch)
4. THE Member_Mode SHALL sync settings across devices via cloud storage
5. THE Member_Mode SHALL display AdSense advertisements (cannot be disabled)
6. THE Member_Mode SHALL show statistics preview (blurred/limited data) with "Upgrade to Pro" prompt
7. THE Member_Mode SHALL display a "Member" badge next to username
8. WHEN a user logs in, THE System SHALL play a brief "Features unlocked" animation

### Requirement 4: Pro 模式功能集 (Pro Mode - 付费订阅用户)

**User Story:** As a Pro subscriber, I want access to all premium features including detailed statistics and health reminders, so that I can maximize my neck exercise routine.

#### Acceptance Criteria

1. THE Pro_Mode SHALL include all Member_Mode features
2. THE Pro_Mode SHALL allow users to disable AdSense advertisements
3. THE Pro_Mode SHALL include OPML import/export for RSS sources
4. THE Pro_Mode SHALL include full statistics tracking with charts (daily/weekly/monthly)
5. THE Pro_Mode SHALL include health reminders with browser notifications
6. THE Pro_Mode SHALL include daily exercise goal setting
7. THE Pro_Mode SHALL support keyboard shortcuts for rotation control
8. THE Pro_Mode SHALL display a "Pro" badge next to username
9. THE Pro_Mode SHALL be implemented as a future feature (subscription system not in initial release)

### Requirement 5: 认证系统

**User Story:** As a user, I want multiple login options, so that I can choose my preferred authentication method.

#### Acceptance Criteria

1. THE System SHALL support Google OAuth authentication
2. THE System SHALL support Microsoft Entra ID authentication
3. THE System SHALL support local username/password authentication (future feature)
4. WHEN a user logs in, THE System SHALL immediately unlock Member_Mode features
5. WHEN a user logs out, THE System SHALL revert to Guest_Mode behavior
6. THE System SHALL persist login session across browser sessions

### Requirement 6: 设置存储策略

**User Story:** As a member, I want my settings saved to the cloud, so that I can access them from any device.

#### Acceptance Criteria

1. WHEN a Guest_User uses the app, THE System SHALL use hardcoded default settings (no storage needed)
2. WHEN a Member_User or Pro_User changes settings, THE System SHALL save to cloud storage
3. THE System SHALL load user settings from cloud on login
4. IF cloud storage is unavailable, THEN THE System SHALL fallback to localStorage
5. THE Database_Layer SHALL remain flexible to support future migration

### Requirement 7: 广告系统

**User Story:** As a product owner, I want to monetize through ads while allowing Pro users to opt out, so that I can sustain the project.

#### Acceptance Criteria

1. THE Guest_Mode SHALL always display AdSense advertisements
2. THE Member_Mode SHALL always display AdSense advertisements
3. THE Pro_Mode SHALL display ads by default but allow users to disable them
4. WHEN a Pro user disables ads, THE System SHALL save this preference to cloud
5. THE Ad_System SHALL use non-intrusive ad placements (sidebar only)

### Requirement 8: UI 差异化与转化激励

**User Story:** As a user, I want to clearly understand what features are available at each tier, so that I know the benefits of logging in or upgrading.

#### Acceptance Criteria

1. WHEN a Guest_User views the settings page, THE System SHALL show locked controls with "Login to unlock" labels
2. WHEN a Member_User views Pro features, THE System SHALL show "Upgrade to Pro" prompts
3. THE Header SHALL show "Login" button for Guest_User
4. THE Header SHALL show username with "Member" badge for Member_User
5. THE Header SHALL show username with "Pro" badge for Pro_User
6. THE System SHALL show a subtle "Login for more features" banner for Guest_User
7. WHEN a Guest_User views the statistics page, THE System SHALL show blurred data with "Login to view" overlay
8. WHEN a Member_User views the statistics page, THE System SHALL show limited preview with "Upgrade to Pro" prompt

### Requirement 9: 性能要求

**User Story:** As a user, I want fast page loads, so that I can start using the app immediately.

#### Acceptance Criteria

1. THE Guest_Mode SHALL load without any API calls (static content only)
2. THE Member_Mode and Pro_Mode SHALL lazy-load statistics and chart components
3. THE System SHALL maintain First Contentful Paint under 1.5 seconds
4. THE System SHALL maintain Largest Contentful Paint under 2.5 seconds
5. THE System SHALL use code splitting to minimize initial bundle size

### Requirement 10: 测试策略

**User Story:** As a QA engineer, I want comprehensive tests that cover all user tiers, so that I can ensure quality for all users.

#### Acceptance Criteria

1. THE Test_Suite SHALL include tests for Guest_User experience
2. THE Test_Suite SHALL include tests for Member_User experience
3. THE Test_Suite SHALL include tests for Pro_User experience (when implemented)
4. THE Test_Suite SHALL verify feature locks work correctly for each tier
5. THE E2E_Tests SHALL cover the login flow and feature unlock experience

### Requirement 11: 功能对比页面

**User Story:** As a user, I want to see a clear comparison of features at each tier, so that I can understand the benefits of logging in or upgrading.

#### Acceptance Criteria

1. THE System SHALL provide a dedicated comparison page at `/pricing` or `/features`
2. THE Comparison_Page SHALL display three columns: Guest, Member (Free), and Pro
3. THE Comparison_Page SHALL list all features with checkmarks indicating availability
4. THE Comparison_Page SHALL highlight that Guest and Member are FREE
5. THE Comparison_Page SHALL include "Login" button for Guest users
6. THE Comparison_Page SHALL include "Coming Soon" label for Pro tier (until subscription is implemented)
7. THE Comparison_Page SHALL be accessible from the header menu and login prompts
8. THE Comparison_Page SHALL be responsive and work well on mobile devices

## Feature Comparison Summary

| 功能             | 访客 (Guest)       | 会员 (Member)      | Pro                 |
| ---------------- | ------------------ | ------------------ | ------------------- |
| **价格**         | 🆓 免费            | 🆓 免费（需登录）  | 💰 付费（未来）     |
| **即开即用**     | ✅ 无需登录        | 需要登录           | 需要订阅            |
| **新闻源**       | 默认源（不可更改） | ✅ 自定义 RSS      | ✅ + OPML 导入/导出 |
| **旋转模式**     | 连续模式（固定）   | ✅ 固定 + 连续可选 | ✅                  |
| **旋转间隔**     | 30秒（固定）       | ✅ 5-60秒可调      | ✅                  |
| **旋转角度**     | 15度（固定）       | ✅ 8-25度可调      | ✅                  |
| **暂停旋转**     | ✅                 | ✅                 | ✅                  |
| **字体大小**     | 中（固定）         | ✅ 4档可调         | ✅                  |
| **布局模式**     | 默认               | ✅ 紧凑/正常可选   | ✅                  |
| **深色模式**     | ✅ 可手动切换      | ✅                 | ✅                  |
| **多语言**       | ✅ 中/英可切换     | ✅                 | ✅                  |
| **AdSense 广告** | 强制显示           | 强制显示           | ✅ 可关闭           |
| **设置云同步**   | ❌                 | ✅ 多设备同步      | ✅                  |
| **统计图表**     | ❌                 | 👀 预览（模糊）    | ✅ 完整数据         |
| **健康提醒**     | ❌                 | ❌                 | ✅                  |
| **运动目标**     | ❌                 | ❌                 | ✅                  |
| **键盘快捷键**   | ❌                 | ❌                 | ✅                  |
| **进度保存**     | ❌ 仅当前会话      | ✅ 永久保存        | ✅                  |
| **用户徽章**     | -                  | 会员徽章           | Pro 徽章            |
