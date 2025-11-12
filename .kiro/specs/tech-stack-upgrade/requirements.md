# 需求文档

## 简介

本文档定义了"摇头看新闻"Web 应用的技术栈升级和功能增强需求。项目目标是从浏览器扩展迁移到现代化的 Web 应用，采用 2025 年最前沿的技术栈，提升用户体验，增加云同步、多语言支持、性能优化等功能，使项目更具竞争力和可维护性。

## 术语表

- **应用系统 (Application System)**: 指"摇头看新闻"Web 应用及其所有组件
- **用户 (User)**: 使用该 Web 应用的最终用户
- **新闻源 (News Source)**: 提供新闻内容的 API 或 RSS 订阅源
- **ISR (Incremental Static Regeneration)**: Next.js 的增量静态再生成机制，用于缓存和更新数据
- **旋转模式 (Rotation Mode)**: 页面旋转的行为模式（固定模式或连续模式）
- **云同步服务 (Cloud Sync Service)**: 用于在多设备间同步用户设置和偏好的后端服务
- **认证提供商 (Authentication Provider)**: 提供用户身份验证的第三方服务（如 Google OAuth）
- **状态管理器 (State Manager)**: 管理应用客户端 UI 状态的系统组件
- **UI 组件库 (UI Component Library)**: 提供预构建 UI 组件的第三方库
- **国际化系统 (i18n System)**: 支持多语言界面的系统
- **Server Components**: React 19 的服务端组件，在服务器端渲染
- **Server Actions**: Next.js 15 的服务端操作，用于处理表单提交和数据变更
- **Marketplace Storage**: Vercel Marketplace Storage，用于存储用户配置数据的键值对存储系统

## 需求

### 需求 1: 技术栈现代化升级

**用户故事:** 作为开发者，我希望项目使用 2025 年最前沿的技术栈和工具，以便提高开发效率、代码质量和项目可维护性

#### 验收标准

1. WHEN 项目构建时，THE 应用系统 SHALL 使用 Next.js 15 或更高版本作为全栈框架
2. WHEN 编写组件代码时，THE 应用系统 SHALL 使用 React 19 的 Server Components 和 Client Components
3. WHEN 构建开发环境时，THE 应用系统 SHALL 使用 Turbopack 作为构建工具
4. WHEN 管理客户端 UI 状态时，THE 应用系统 SHALL 使用 Zustand 作为轻量级状态管理器
5. WHEN 构建 UI 界面时，THE 应用系统 SHALL 集成 Shadcn/ui 组件库和 Radix UI 底层原语
6. WHEN 编写 TypeScript 代码时，THE 应用系统 SHALL 使用 TypeScript 5.7 或更高版本的严格模式
7. WHEN 处理样式时，THE 应用系统 SHALL 使用 Tailwind CSS 4 或更高版本

### 需求 2: 用户认证与云同步功能

**用户故事:** 作为用户，我希望能够登录账号并在多个设备间同步我的设置和偏好，以便在不同设备上获得一致的体验

#### 验收标准

1. WHEN 用户点击登录按钮时，THE 应用系统 SHALL 使用 NextAuth.js v5 提供 Google OAuth 认证选项
2. WHEN 用户成功认证后，THE 应用系统 SHALL 将用户的设置数据存储到 Vercel Marketplace Storage
3. WHEN 用户在新设备登录时，THE 应用系统 SHALL 从 Vercel Marketplace Storage 加载用户的历史设置
4. WHEN 用户修改设置时，THE 应用系统 SHALL 通过 Server Actions 在 3 秒内将更改同步到 Marketplace Storage
5. WHEN Marketplace Storage 不可用时，THE 应用系统 SHALL 显示错误提示并允许用户稍后重试
6. WHEN 用户登出时，THE 应用系统 SHALL 清除会话令牌但保留 Marketplace Storage 中的用户数据

### 需求 3: 多语言国际化支持

**用户故事:** 作为国际用户，我希望应用界面能够显示我的母语，并自动切换到相应语言的新闻源，以便更好地理解和使用应用

#### 验收标准

1. WHEN 应用首次加载时，THE 应用系统 SHALL 根据浏览器的 Accept-Language 头自动选择界面语言（中文或英文）
2. WHEN 用户切换界面语言时，THE 应用系统 SHALL 通过 Server Actions 更新用户偏好并在 1 秒内刷新页面
3. WHEN 界面语言为中文时，THE 应用系统 SHALL 优先从中文新闻源获取内容
4. WHEN 界面语言为英文时，THE 应用系统 SHALL 优先从英文新闻源获取内容
5. WHEN 添加新的语言支持时，THE 应用系统 SHALL 使用 next-intl 库管理翻译文本
6. WHEN 缺少某个语言的翻译时，THE 应用系统 SHALL 回退到英文显示

### 需求 4: 性能优化与智能缓存

**用户故事:** 作为用户，我希望应用加载速度快且流畅，即使在网络条件不佳时也能快速查看新闻，以便获得更好的使用体验

#### 验收标准

1. WHEN 用户访问应用时，THE 应用系统 SHALL 使用 Next.js ISR 在 1.5 秒内显示缓存的新闻内容
2. WHEN 新闻数据过期时，THE 应用系统 SHALL 使用 revalidate 配置每 3600 秒（1小时）后台重新验证数据
3. WHEN 用户手动刷新新闻时，THE 应用系统 SHALL 使用 revalidateTag 立即更新指定新闻源的缓存
4. WHEN 使用原生 Fetch API 时，THE 应用系统 SHALL 配置 next.revalidate 选项实现自动缓存管理
5. WHEN API 请求失败时，THE 应用系统 SHALL 返回最后一次成功缓存的数据并显示错误提示
6. WHEN 用户切换新闻源时，THE 应用系统 SHALL 在 800 毫秒内从 ISR 缓存加载内容

### 需求 5: UI/UX 增强与自定义选项

**用户故事:** 作为用户，我希望能够自定义应用的外观和布局，以便根据个人喜好调整阅读体验

#### 验收标准

1. WHEN 用户打开设置面板时，THE 应用系统 SHALL 使用 Shadcn/ui 组件提供字体大小调整选项（小、中、大、特大）
2. WHEN 用户选择紧凑布局模式时，THE 应用系统 SHALL 通过 Tailwind CSS 类减少新闻项之间的间距至原来的 50%
3. WHEN 用户启用深色模式时，THE 应用系统 SHALL 使用 next-themes 在 0.3 秒内切换到深色主题配色
4. WHEN 用户调整旋转速度时，THE 应用系统 SHALL 使用 Shadcn/ui Slider 组件提供范围从 5 秒到 300 秒的控件
5. WHEN 用户启用页面旋转动画时，THE 应用系统 SHALL 使用 Framer Motion 显示平滑的旋转过渡效果
6. WHEN 用户禁用动画效果时，THE 应用系统 SHALL 检测 prefers-reduced-motion 媒体查询并禁用所有动画

### 需求 6: 页面旋转动画系统

**用户故事:** 作为用户，我希望页面旋转动画流畅自然，并能根据我的偏好进行调整，以便在阅读新闻时获得舒适的颈椎运动体验

#### 验收标准

1. WHEN 应用渲染页面时，THE 应用系统 SHALL 使用 Framer Motion 在客户端组件中实现旋转动画
2. WHEN 页面旋转时，THE 应用系统 SHALL 使用 motion.div 组件以 0.6 秒的 easeInOut 过渡效果旋转内容
3. WHEN 用户选择固定模式时，THE 应用系统 SHALL 将旋转角度限制在 -2 度到 2 度之间
4. WHEN 用户选择连续模式时，THE 应用系统 SHALL 根据用户设定的时间间隔自动改变旋转角度
5. WHEN 用户暂停旋转时，THE 应用系统 SHALL 使用 Zustand 存储暂停状态并停止角度变化
6. WHEN 检测到 prefers-reduced-motion 时，THE 应用系统 SHALL 自动禁用所有旋转动画

### 需求 7: 增强的新闻源管理

**用户故事:** 作为用户，我希望能够更灵活地管理新闻源，包括分类、排序和自定义配置，以便获取更相关的新闻内容

#### 验收标准

1. WHEN 用户添加 RSS 源时，THE 应用系统 SHALL 通过 Server Actions 验证 RSS URL 并提取源的标题和描述
2. WHEN 用户查看新闻源列表时，THE 应用系统 SHALL 从 Vercel Marketplace Storage 读取用户自定义的排序顺序并显示
3. WHEN 用户为新闻源添加标签时，THE 应用系统 SHALL 通过 Server Actions 将标签数据存储到 Marketplace Storage
4. WHEN 某个新闻源连续 3 次获取失败时，THE 应用系统 SHALL 使用 Zod 验证错误并在 UI 中显示警告提示
5. WHEN 用户拖拽排序新闻源时，THE 应用系统 SHALL 使用 Zustand 临时存储排序状态并通过 Server Actions 持久化
6. WHEN 用户导出新闻源配置时，THE 应用系统 SHALL 通过 Server Actions 生成 OPML 格式的文件并触发下载

### 需求 8: 数据分析与健康提醒

**用户故事:** 作为用户，我希望应用能够追踪我的颈椎运动情况并提供健康建议，以便更好地改善颈椎健康

#### 验收标准

1. WHEN 用户完成一次完整的页面旋转周期时，THE 应用系统 SHALL 通过 Server Actions 将运动记录存储到 Vercel Marketplace Storage
2. WHEN 用户查看统计数据时，THE 应用系统 SHALL 从 Marketplace Storage 读取数据并在 Server Components 中渲染每日、每周和每月的运动次数
3. WHEN 用户连续 2 小时未进行颈椎运动时，THE 应用系统 SHALL 使用浏览器 Notification API 发送温馨提醒
4. WHEN 用户达到每日运动目标时，THE 应用系统 SHALL 使用 Shadcn/ui Toast 组件显示鼓励性消息
5. WHEN 用户查看健康报告时，THE 应用系统 SHALL 使用 Recharts 或 Chart.js 提供可视化图表展示运动趋势
6. WHEN 用户设置运动目标时，THE 应用系统 SHALL 使用 Shadcn/ui Slider 组件允许自定义每日目标次数（10-100次）

### 需求 9: 代码质量与测试覆盖

**用户故事:** 作为开发者，我希望项目具有完善的测试覆盖和代码质量保障，以便减少 bug 并提高代码可维护性

#### 验收标准

1. WHEN 提交代码时，THE 应用系统 SHALL 通过 Husky 和 lint-staged 自动运行 ESLint 9 和 Prettier 的代码检查
2. WHEN 运行单元测试时，THE 应用系统 SHALL 使用 Vitest 作为测试框架
3. WHEN 测试 React 组件时，THE 应用系统 SHALL 使用 React Testing Library 进行组件测试
4. WHEN 测试 Server Actions 时，THE 应用系统 SHALL 使用 Vitest 的 mock 功能模拟 Marketplace Storage 和外部 API
5. WHEN 运行端到端测试时，THE 应用系统 SHALL 使用 Playwright 测试关键用户流程（登录、新闻浏览、设置保存）
6. WHEN 构建生产版本时，THE 应用系统 SHALL 确保核心功能的测试覆盖率达到 70% 以上

### 需求 10: 开发体验优化

**用户故事:** 作为开发者，我希望拥有良好的开发工具和工作流，以便提高开发效率和代码质量

#### 验收标准

1. WHEN 启动开发服务器时，THE 应用系统 SHALL 使用 Turbopack 在 2 秒内完成启动并启用热模块替换
2. WHEN 修改代码时，THE 应用系统 SHALL 使用 Turbopack 的快速刷新在 300 毫秒内反映更改到浏览器
3. WHEN 使用 TypeScript 时，THE 应用系统 SHALL 配置 tsconfig.json 提供完整的类型提示和自动补全
4. WHEN 提交代码时，THE 应用系统 SHALL 通过 Husky 和 lint-staged 自动运行 ESLint、Prettier 和类型检查
5. WHEN 编写组件时，THE 应用系统 SHALL 支持 React DevTools 和 Next.js DevTools 进行调试
6. WHEN 构建项目时，THE 应用系统 SHALL 使用 @next/bundle-analyzer 生成详细的构建分析报告
7. WHEN 编写 commit 消息时，THE 应用系统 SHALL 使用 Commitizen 提供规范化的 commit 消息格式
