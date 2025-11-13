# 实施计划

本文档将设计转换为可执行的编码任务。每个任务都是增量式的，确保代码始终处于可工作状态。

## 任务列表

- [x] 1. 项目初始化和基础配置

  - 创建 Next.js 15 项目，配置 TypeScript、Tailwind CSS 4 和 Turbopack
  - 安装核心依赖：React 19、Shadcn/ui、Zustand、Framer Motion
  - 配置 ESLint 9、Prettier、Husky 和 lint-staged
  - 设置项目目录结构（app、components、lib、types）
  - _需求: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [x] 2. 类型定义和数据模型

  - 创建 types/settings.ts，定义 UserSettings 和 Zod schema
  - 创建 types/news.ts，定义 NewsItem 和 NewsResponse schema
  - 创建 types/stats.ts，定义 UserStats 和 RotationRecord schema
  - 创建 types/rss.ts，定义 RSSSource schema
  - _需求: 1.6, 4.4_

- [x] 3. Vercel Marketplace Storage 和认证配置

  - 配置 Vercel Marketplace Storage 客户端（lib/storage.ts）
  - 配置 NextAuth.js v5 与 Google OAuth（lib/auth.ts）
  - 创建认证代理文件（proxy.ts）保护路由
  - 创建登录页面（app/(auth)/login/page.tsx）
  - _需求: 2.1, 2.2, 2.3_

- [x] 4. 基础布局和 UI 组件

  - 安装和配置 Shadcn/ui 组件库
  - 创建根布局（app/layout.tsx）和全局样式（app/globals.css）
  - 配置 next-themes 支持深色模式
  - 创建 Header 和 Footer 组件
  - 添加 Lucide React 图标
  - _需求: 1.5, 1.7, 5.3_

- [x] 5. 新闻数据服务和 Server Actions

  - 创建 lib/actions/news.ts，实现 getNews 和 refreshNews
  - 配置 ISR 缓存策略（revalidate: 3600, tags）
  - 实现 getRSSNews 函数解析 RSS 源
  - 添加错误处理和重试逻辑
  - _需求: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [x] 6. 新闻展示组件（Server Components）

  - 创建 components/news/NewsDisplay.tsx（Server Component）
  - 创建 components/news/NewsList.tsx 展示新闻列表
  - 创建 components/news/NewsItem.tsx 展示单条新闻
  - 添加 Suspense 和 Loading 状态
  - 创建首页（app/(main)/page.tsx）集成新闻展示
  - _需求: 4.1, 4.6_

- [x] 7. 页面旋转动画系统

  - 创建 lib/stores/rotation-store.ts（Zustand store）
  - 创建 components/rotation/TiltWrapper.tsx（Client Component）
  - 使用 Framer Motion 实现旋转动画
  - 实现固定模式和连续模式逻辑
  - 检测 prefers-reduced-motion 并禁用动画
  - 在首页集成 TiltWrapper
  - _需求: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

-

- [x] 8. 用户设置管理

  - 创建 lib/actions/settings.ts，实现 getUserSettings 和 updateSettings
  - 创建 components/settings/SettingsPanel.tsx（Client Component）
  - 使用 Shadcn/ui 组件（Slider, Switch, Select）构建设置表单
  - 实现设置保存和同步到 Vercel Marketplace Storage
  - 创建设置页面（app/(main)/settings/page.tsx）
  - _需求: 2.2, 2.3, 2.4, 5.1, 5.2, 5.4_

- [x] 9. 国际化支持

  - 安装和配置 next-intl
  - 创建 messages/zh.json 和 messages/en.json 翻译文件
  - 创建 i18n.ts 配置文件
  - 创建 components/settings/LanguageSelector.tsx 语言切换组件
  - 在所有组件中使用 useTranslations hook
  - 根据语言切换新闻源
  - _需求: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 10. RSS 源管理功能

  - 创建 lib/actions/rss.ts，实现 RSS 源 CRUD 操作
  - 创建 components/rss/RSSSourceList.tsx 展示 RSS 源列表
  - 创建 components/rss/AddRSSSourceDialog.tsx 添加 RSS 源对话框
  - 实现 RSS 源启用/禁用、排序和标签功能
  - 实现 exportOPML 导出功能
  - 创建 RSS 管理页面（app/(main)/rss/page.tsx）
  - _需求: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

-

- [x] 11. 统计数据和健康提醒

  - 创建 lib/actions/stats.ts，实现 recordRotation 和 getStats
  - 创建 components/stats/StatsDisplay.tsx 展示统计数据
  - 使用 Recharts 或 Chart.js 创建可视化图表
  - 实现浏览器 Notification API 发送提醒
  - 创建统计页面（app/(main)/stats/page.tsx）
  - _需求: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [x] 12. UI/UX 增强功能

  - 创建 components/settings/ThemeToggle.tsx 主题切换组件
  - 实现字体大小调整功能（CSS 类和 Zustand store）
  - 实现紧凑布局模式切换
  - 创建 components/rotation/RotationControls.tsx 旋转控制组件
  - 添加暂停/继续旋转按钮
  - 实现旋转速度滑块调整
  - _需求: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

-

- [x] 13. 性能优化

  - 配置 Next.js Image 组件优化图片加载
  - 实现代码分割（dynamic import）重型组件
  - 添加预连接和 DNS 预取到外部域名
  - 配置字体预加载
  - 优化 ISR 缓存策略和 revalidateTag 使用
  - 添加 @next/bundle-analyzer 分析包体积
  - _需求: 4.1, 4.2, 4.6, 10.6_

- [x] 14. 错误处理和边界

- [ ] 14. 错误处理和边界

  - 创建 components/ErrorBoundary.tsx 错误边界组件
  - 创建 lib/utils/error-handler.ts 错误处理工具
  - 在 Server Actions 中添加统一错误处理
  - 创建 app/error.tsx 和 app/not-found.tsx 错误页面
  - 添加表单验证错误提示（使用 Zod）
  - _需求: 4.5_

- [x] 15. 安全加固

  - 配置 Content Security Policy（CSP）headers
  - 实现速率限制（lib/rate-limit.ts）
  - 添加输入验证和清理函数
  - 配置 CORS 和安全 headers
  - 在 Server Actions 中验证用户权限
  - _需求: 2.1, 2.6_

- [x] 16. 部署配置

  - 创建 vercel.json 配置文件
  - 配置环境变量（.env.example）
  - 设置 Next.js 配置（next.config.js）
  - 配置图片域名白名单
  - 设置重定向和 headers
  - 配置 Vercel 区域（香港、新加坡）
  - _需求: 1.1_

- [x] 17. 测试实施

  - 配置 Vitest 和 React Testing Library
  - 配置 Playwright 用于 E2E 测试
  - 创建测试设置文件（tests/setup.ts）
  - _需求: 9.2, 9.3, 9.5_

- [x] 17.1 编写 Server Actions 单元测试

  - 测试 lib/actions/settings.ts（getUserSettings, updateSettings）
  - 测试 lib/actions/news.ts（getNews, refreshNews）
  - 测试 lib/actions/stats.ts（recordRotation, getStats）
  - 测试 lib/actions/rss.ts（RSS CRUD 操作）
  - Mock Vercel Marketplace Storage 和 NextAuth
  - _需求: 9.2, 9.4, 9.6_

- [x] 17.2 编写组件单元测试

  - 测试 SettingsPanel 组件
  - 测试 TiltWrapper 组件
  - 测试 LanguageSelector 组件
  - 测试 ThemeToggle 组件
  - _需求: 9.3, 9.6_

- [x] 17.3 编写 E2E 测试

  - 测试新闻浏览流程
  - 测试用户登录和设置保存流程
  - 测试页面旋转功能
  - 测试 RSS 源管理流程
  - _需求: 9.5, 9.6_

- [x] 18. 监控和日志

  - 集成 Sentry 错误监控（lib/sentry.ts）
  - 配置 Google Analytics 或 Vercel Analytics
  - 创建 lib/analytics.ts 追踪事件
  - 添加性能监控（Web Vitals）
  - 配置日志记录策略
  - _需求: 10.1_

- [x] 19. CI/CD 配置

  - 创建 .github/workflows/ci.yml
  - 配置 lint、type-check、test 和 build 任务
  - 配置代码覆盖率上传到 Codecov
  - 设置自动部署到 Vercel
  - _需求: 9.1, 10.4_

- [x] 20. 文档和迁移工具
  - 更新 README.md 包含新技术栈说明
  - 创建 MIGRATION.md 迁移指南
  - 创建用户设置导入工具（从旧版本）
  - 编写 API 文档
  - 创建开发者指南
  - _需求: 1.1_

## 任务执行说明

### 执行顺序

任务按照依赖关系排序，建议按顺序执行。每个任务完成后应确保：

1. 代码可以成功构建
2. 没有 TypeScript 错误
3. 没有 ESLint 警告
4. 相关功能可以正常工作

### 可选任务

标记为 `*` 的任务（如 17.1, 17.2, 17.3）为可选任务，主要是测试相关。这些任务可以根据项目需求决定是否实施。

### 增量开发

每个任务都应该是独立可测试的。完成一个任务后，应该能够运行应用并验证新功能。避免一次性实现多个任务。

### 代码审查检查点

建议在以下任务完成后进行代码审查：

- 任务 4 完成后（基础 UI 搭建完成）
- 任务 8 完成后（核心功能完成）
- 任务 12 完成后（所有功能完成）
- 任务 16 完成后（部署前检查）

### 测试策略

- 核心业务逻辑（Server Actions）必须有单元测试
- 关键用户流程必须有 E2E 测试
- UI 组件测试为可选，优先测试复杂交互组件
- 目标测试覆盖率：70%+

### 性能目标

- 首屏加载时间（LCP）< 2.5s
- 首次输入延迟（FID）< 100ms
- 累积布局偏移（CLS）< 0.1
- Time to Interactive（TTI）< 3.5s

### 部署检查清单

在部署到生产环境前，确保：

- [ ] 所有环境变量已配置
- [ ] 数据库/Marketplace Storage 已设置
- [ ] OAuth 回调 URL 已配置
- [ ] 域名和 SSL 证书已配置
- [ ] 错误监控已启用
- [ ] 性能监控已启用
- [ ] 备份策略已制定
- [ ] 回滚计划已准备

## 预估时间

| 任务组                      | 任务数 | 预估时间     |
| --------------------------- | ------ | ------------ |
| 1-4: 项目初始化和基础配置   | 4      | 2-3 天       |
| 5-7: 核心功能（新闻和旋转） | 3      | 3-4 天       |
| 8-12: 高级功能              | 5      | 4-5 天       |
| 13-16: 优化和部署           | 4      | 2-3 天       |
| 17-20: 测试、监控和文档     | 4      | 3-4 天       |
| **总计**                    | **20** | **14-19 天** |

注：以上时间为单人全职开发的预估时间。实际时间可能因开发者经验和项目复杂度而异。
