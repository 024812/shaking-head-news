# Implementation Plan: Project Merge (Three-Tier User System)

## Overview

将 shaking-news 和 shaking-head-news 合并为一个统一代码库。采用三层用户模式：
- **访客 (Guest)**：即开即用，无需登录，功能受限
- **会员 (Member)**：免费登录，解锁自定义功能
- **Pro**：付费订阅（未来），解锁高级功能（统计、提醒等）

## Tasks

- [x] 1. 创建功能开关系统核心
  - [x] 1.1 创建功能配置文件 `lib/config/features.ts`
    - 定义 `UserTier` 类型 ('guest' | 'member' | 'pro')
    - 定义 `FeatureConfig` 接口
    - 定义 `GUEST_FEATURES`, `MEMBER_FEATURES`, `PRO_FEATURES` 常量
    - 实现 `getFeaturesForTier()` 函数
    - _Requirements: 1.2, 2.3, 3.2, 4.1_
  - [x] 1.2 创建默认设置文件 `lib/config/defaults.ts`
    - 定义 `DEFAULT_SETTINGS` 常量
    - 定义 `UserSettings` 类型
    - _Requirements: 2.3, 6.1_
  - [ ]* 1.3 编写功能配置的属性测试
    - **Property 1: Feature Availability Based on User Tier**
    - **Validates: Requirements 1.2, 1.3, 1.4, 1.5**

- [x] 2. 实现 Data Access Layer (DAL)
  - [x] 2.1 创建认证 DAL `lib/dal/auth.ts`
    - 实现 `getCurrentUser()` 函数（使用 React cache）
    - 实现 `verifyAuth()` 函数
    - _Requirements: 1.2, 5.4, 5.5_
  - [x] 2.2 创建设置 DAL `lib/dal/settings.ts`
    - 实现 `getUserSettings()` 函数
    - 实现 `saveUserSettings()` 函数
    - 实现云存储回退到 localStorage 逻辑
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  - [ ]* 2.3 编写设置 DAL 的属性测试
    - **Property 2: Default Settings for Guest Users**
    - **Property 5: Settings Cloud Sync Round-Trip**
    - **Validates: Requirements 2.3, 6.1, 6.2, 6.3**

- [ ] 3. Checkpoint - 确保核心功能测试通过
  - 运行所有测试，确保功能配置和 DAL 正常工作
  - 如有问题，询问用户

- [x] 4. 实现用户层级 Hooks 和工具
  - [x] 4.1 创建客户端 `useUserTier` hook `hooks/use-user-tier.ts`
    - 基于 `useSession` 判断用户层级
    - 返回 `tier`, `features`, `isGuest`, `isMember`, `isPro`, `user` 等
    - _Requirements: 1.3, 1.4, 1.5_
  - [x] 4.2 创建服务端层级检查 `lib/tier-server.ts`
    - 实现 `getUserTier()` 函数用于 Server Components
    - _Requirements: 1.2_
  - [ ]* 4.3 编写层级检查的单元测试
    - 测试未登录返回 guest
    - 测试已登录无订阅返回 member
    - 测试已登录有订阅返回 pro
    - _Requirements: 1.3, 1.4, 1.5_

- [x] 5. 创建层级功能组件
  - [x] 5.1 创建客户端 `TierFeature` 组件 `components/tier/TierFeature.tsx`
    - 根据功能配置条件渲染
    - 支持 fallback、showLock、requiredTier 选项
    - _Requirements: 8.1, 8.2_
  - [x] 5.2 创建服务端 `TierFeatureServer` 组件 `components/tier/TierFeatureServer.tsx`
    - 用于 Server Components 的条件渲染
    - _Requirements: 8.1_
  - [x] 5.3 创建 `LockedFeature` 组件 `components/tier/LockedFeature.tsx`
    - 显示锁定状态和登录/升级提示
    - 根据 requiredTier 显示不同提示
    - _Requirements: 8.1, 8.2_
  - [x] 5.4 创建 `UserBadge` 组件 `components/tier/UserBadge.tsx`
    - 显示会员或 Pro 徽章
    - _Requirements: 3.7, 4.8_
  - [x] 5.5 创建 `UpgradePrompt` 组件 `components/tier/UpgradePrompt.tsx`
    - 支持 banner, modal, inline 三种变体
    - 根据当前层级显示不同提示（登录/升级到 Pro）
    - _Requirements: 8.6_

- [x] 6. 实现广告系统
  - [x] 6.1 更新 `AdBanner` 组件 `components/ads/AdBanner.tsx`
    - Guest 和 Member 强制显示广告
    - Pro 用户可根据设置显示/隐藏
    - _Requirements: 7.1, 7.2, 7.3_
  - [ ]* 6.2 编写广告可见性的属性测试
    - **Property 3: Ad Visibility Rules**
    - **Validates: Requirements 7.1, 7.2, 7.3**

- [ ] 7. Checkpoint - 确保组件测试通过
  - 运行所有测试，确保层级组件和广告系统正常工作
  - 如有问题，询问用户

- [x] 8. 更新设置页面
  - [x] 8.1 更新 `SettingsPanel` 组件
    - Guest: 显示锁定控件 + "登录解锁"
    - Member: 显示可用控件
    - Pro: 显示全部控件
    - _Requirements: 2.4, 8.1_
  - [x] 8.2 更新旋转设置组件
    - Guest 使用固定值，Member/Pro 可调节
    - _Requirements: 2.3, 3.2_
  - [x] 8.3 添加广告设置组件 (Pro only)
    - 仅 Pro 用户可关闭广告
    - Member 显示 "升级到 Pro 关闭广告" 提示
    - _Requirements: 7.3, 7.4_
  - [ ]* 8.4 编写设置修改权限的属性测试
    - **Property 4: Settings Modification Permissions**
    - **Validates: Requirements 2.4, 3.2**

- [x] 9. 更新统计页面
  - [x] 9.1 创建 `BlurredStats` 组件 `components/stats/BlurredStats.tsx`
    - Guest: 显示 "登录查看统计"
    - Member: 显示模糊预览 + "升级到 Pro 查看完整数据"
    - _Requirements: 8.7, 8.8_
  - [x] 9.2 更新统计页面 `app/(main)/stats/page.tsx`
    - 根据用户层级显示不同内容
    - Pro 显示完整统计（未来实现）
    - _Requirements: 3.6, 4.4, 8.7, 8.8_

- [-] 10. 实现 RSS 和 OPML 功能
  - [x] 10.1 更新 RSS 管理页面
    - Guest: 显示默认源（不可编辑）+ "登录自定义"
    - Member: 可管理自定义源
    - Pro: 可管理 + OPML 导入/导出
    - _Requirements: 2.2, 3.3, 4.3_
  - [x] 10.2 实现 OPML 导入/导出功能 (Pro only)
    - 创建 `lib/opml.ts` 解析器和序列化器
    - _Requirements: 4.3_
  - [ ]* 10.3 编写 OPML 往返测试
    - **Property 6: OPML Import/Export Round-Trip**
    - **Validates: Requirements 4.3**
  - [ ]* 10.4 编写 RSS 源管理的属性测试
    - **Property 7: RSS Source Management Invariants**
    - **Validates: Requirements 3.3**

- [ ] 11. Checkpoint - 确保页面功能测试通过
  - 运行所有测试，确保设置、统计、RSS 页面正常工作
  - 如有问题，询问用户

- [x] 12. 创建功能对比页面
  - [x] 12.1 创建对比页面 `app/(main)/features/page.tsx`
    - 三列布局：Guest vs Member vs Pro
    - 功能对比列表
    - _Requirements: 11.1, 11.2, 11.3_
  - [x] 12.2 创建 `PricingCard` 组件 `components/features/PricingCard.tsx`
    - 显示层级名称、价格、功能列表
    - Pro 显示 "Coming Soon"
    - _Requirements: 11.4, 11.6_
  - [x] 12.3 创建 `FeatureRow` 组件 `components/features/FeatureRow.tsx`
    - 显示功能名称和各层级可用性标记
    - _Requirements: 11.3_
  - [x] 12.4 添加登录按钮和导航链接（在 FeaturesComparison 中实现）
    - 从 header 和登录提示可访问对比页面
    - _Requirements: 11.5, 11.7_

- [x] 13. 更新 Header 组件
  - [x] 13.1 更新 Header 显示逻辑
    - Guest: 显示 "登录" 按钮
    - Member: 显示用户名 + 会员徽章
    - Pro: 显示用户名 + Pro 徽章
    - _Requirements: 8.3, 8.4, 8.5_
  - [x] 13.2 添加升级提示 banner
    - Guest: 显示 "登录解锁更多功能" banner
    - _Requirements: 8.6_
  - [x] 13.3 添加功能对比页面导航链接
    - _Requirements: 11.7_

- [x] 14. Pro 功能占位实现（未来付费功能）
  - [x] 14.1 创建键盘快捷键 hook `hooks/use-keyboard-shortcuts.ts`
    - 仅 Pro 用户启用（当前返回空操作）
    - _Requirements: 4.7_
  - [x] 14.2 创建健康提醒组件占位
    - 仅 Pro 用户可见（当前显示 Coming Soon）
    - _Requirements: 4.5_
  - [x] 14.3 创建运动目标组件占位
    - 仅 Pro 用户可见（当前显示 Coming Soon）
    - _Requirements: 4.6_

- [x] 15. 实现登录解锁动画
  - [x] 15.1 创建 `UnlockAnimation` 组件 `components/tier/UnlockAnimation.tsx`
    - 登录后播放简短动画
    - _Requirements: 3.8_

- [x] 16. 更新国际化文件
  - [x] 16.1 更新 `messages/zh.json`
    - 添加三层模式相关翻译
    - 添加功能对比页面翻译
    - _Requirements: 2.6_
  - [x] 16.2 更新 `messages/en.json`
    - 添加三层模式相关翻译
    - 添加功能对比页面翻译
    - _Requirements: 2.6_

- [ ] 17. Checkpoint - 确保所有功能测试通过
  - 运行所有单元测试和属性测试
  - 如有问题，询问用户

- [ ] 18. 编写 E2E 测试
  - [ ]* 18.1 编写 Guest 用户旅程测试
    - 访问首页、查看锁定功能、点击登录提示
    - _Requirements: 10.1_
  - [ ]* 18.2 编写 Member 用户旅程测试
    - 登录、修改设置、查看统计预览
    - _Requirements: 10.2_
  - [ ]* 18.3 编写功能对比页面测试
    - 导航、内容验证、响应式设计
    - _Requirements: 11.8_

- [x] 19. Final Checkpoint - 确保所有测试通过
  - 运行所有测试（单元、属性、E2E）
  - 验证性能指标（FCP < 1.5s, LCP < 2.5s）
  - 如有问题，询问用户

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Pro 功能在初始版本中仅做占位实现，待订阅系统完成后启用
- 使用 TypeScript 实现所有代码
- 使用 `@fast-check/vitest` 进行属性测试
- 使用 Playwright 进行 E2E 测试
