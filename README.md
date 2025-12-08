# 🚀 摇头看新闻 (Shaking Head News)

> **"Shake your head while watching the news"** - 一边摇头一边看新闻的颈椎健康 Web 应用

<p align="center">
  <img width="128" height="128" src="public/icons/ytkxw.png" alt="Shaking Head News Logo" />
</p>

<p align="center">
  <a href="https://github.com/024812/shaking-head-news/actions/workflows/ci.yml">
    <img src="https://github.com/024812/shaking-head-news/actions/workflows/ci.yml/badge.svg" alt="CI/CD Status" />
  </a>
  <a href="https://codecov.io/gh/024812/shaking-head-news">
    <img src="https://codecov.io/gh/024812/shaking-head-news/branch/main/graph/badge.svg" alt="Code Coverage" />
  </a>
  <a href="https://github.com/024812/shaking-head-news/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MPL--2.0-blue.svg" alt="License" />
  </a>
</p>

<p align="center">
  <a href="#english-summary">English</a> •
  <a href="#-在线演示">在线演示</a> •
  <a href="#-主要特色">特色功能</a> •
  <a href="#-快速开始">快速开始</a> •
  <a href="#-技术栈">技术栈</a>
</p>

---

## English Summary

Shaking Head News is a modern web application that promotes neck health through gentle page rotation while browsing daily news. Built with Next.js 16 and React 19, it features customizable news sources, smart caching, user authentication, and two neck health modes to encourage cervical activity.

**Key Features:**

- 📰 Customizable news sources with RSS support
- 🤸 Two rotation modes (Fixed/Continuous) for neck health
- 🔐 Google & Microsoft OAuth authentication with cloud sync
- 🌍 Multi-language support (Chinese/English)
- 📊 Statistics tracking and health reminders
- 🎨 Modern UI with dark mode support
- ⚡ Optimized performance with ISR and caching

---

## 🚀 **在线演示**

[https://024812.xyz](https://024812.xyz)

> 现已升级为 Web 应用，无需安装浏览器扩展，直接访问即可使用！

### 🆕 最近更新 (2025-12)

- ✅ **技术栈升级**: 升级至 Next.js 16、React 19.2、Tailwind CSS 4.1
- ✅ **旋转角度优化**: 将最小旋转角度提升至 8-25 度，增强摇头效果
- ✅ **CSS 加载修复**: 优化 PostCSS 配置，确保 Vercel 部署时样式正确加载
- ✅ **设置持久化**: 使用 Microsoft 稳定标识符，确保用户设置跨会话保留
- ✅ **主题切换优化**: 设置页面主题选项现在可以正常工作
- ✅ **旋转间隔调整**: 将旋转间隔范围从 5-300秒 优化为 5-60秒

---

## **项目理念**

看新闻让人摇头叹息？不如真的摇摇头！这款应用让你在浏览每日新闻的同时，通过巧妙的页面转动设计促进颈椎活动，把"摇头叹息"变成"健康摇头"。

---

## ✨ **主要特色**

### 📰 **高度可定制的新闻源**

- **内置新闻**: 默认集成 [EverydayNews](https://github.com/ravelloh/everydaynews) 数据源
- **RSS 订阅**: 支持添加、管理和切换多个自定义 RSS 订阅源
- **智能缓存**: ISR (Incremental Static Regeneration) 缓存策略，加速内容加载
- **OPML 导入/导出**: 方便迁移和备份 RSS 订阅

### 🤸 **智能颈椎健康模式**

- **两种核心模式**:
  - **固定模式 (Fixed)**: 页面保持近乎固定，仅进行微小、不易察觉的转动，适合需要集中注意力的静态阅读
  - **连续模式 (Continuous)**: 页面按用户设定的时间间隔（5-60秒可调）自动转动（8-25度），有效提醒和促进颈部活动
- **动效与无障碍**:
  - **尊重系统偏好**: 自动检测并遵循操作系统的"减弱动态效果"设置
  - **手动控制**: 用户可随时暂停/继续页面旋转，或完全禁用旋转效果
  - **智能禁用**: 在设置页面自动禁用旋转，避免干扰用户调整设置
  - **清晰的状态提示**: 明确告知用户当前的旋转状态（激活、暂停、禁用）

### 🔐 **用户认证与云同步**

- **Google & Microsoft OAuth 登录**: 支持多种安全便捷的第三方登录方式
- **稳定的用户标识**: 使用 Google 提供的永久标识符，确保设置持久化
- **云端设置同步**: 用户设置自动保存到 Upstash Redis，跨设备同步
- **隐私保护**: 仅存储必要的用户设置，不收集个人信息

### 📊 **统计数据与健康提醒**

- **运动记录**: 自动记录每次页面旋转的角度和时长
- **数据可视化**: 图表展示每日、每周、每月的运动统计
- **健康提醒**: 浏览器通知提醒用户达成每日运动目标
- **目标设置**: 自定义每日运动次数目标

### 🌍 **多语言支持**

- **中英文切换**: 完整的中英文界面支持
- **自动新闻源切换**: 根据语言自动切换对应的新闻源
- **本地化日期时间**: 根据用户语言显示本地化的日期和时间格式

### 🎨 **现代化用户体验**

- **响应式设计**: 完美适配桌面、平板和移动设备
- **深色模式**: 支持浅色/深色/跟随系统三种主题模式
- **即时主题切换**: 设置页面和顶部按钮均可切换主题，立即生效
- **字体大小调整**: 4 档字体大小可选（小、中、大、特大）
- **布局模式**: 紧凑/正常布局模式切换
- **流畅动画**: Framer Motion 驱动的流畅过渡动画
- **无障碍支持**: 完整的键盘导航和屏幕阅读器支持

---

## 🛠️ **技术栈**

### 核心框架

- **[Next.js 16](https://nextjs.org/)** - React 框架，支持 App Router、Server Components 和 ISR
- **[React 19.2](https://react.dev/)** - 最新的 React 版本
- **[TypeScript 5.7+](https://www.typescriptlang.org/)** - 类型安全的 JavaScript

### UI 和样式

- **[Tailwind CSS 4.1](https://tailwindcss.com/)** - 实用优先的 CSS 框架
- **[Shadcn/ui](https://ui.shadcn.com/)** - 高质量的 React 组件库
- **[Radix UI](https://www.radix-ui.com/)** - 无障碍的 UI 组件基础
- **[Framer Motion](https://www.framer.com/motion/)** - 强大的动画库
- **[Lucide React](https://lucide.dev/)** - 美观的图标库

### 状态管理和数据

- **[Zustand](https://zustand-demo.pmnd.rs/)** - 轻量级状态管理
- **[Zod](https://zod.dev/)** - TypeScript 优先的模式验证
- **[NextAuth.js v5](https://next-auth.js.org/)** - 完整的认证解决方案
- **[Upstash Redis](https://upstash.com/)** - Serverless Redis 数据库 (Vercel Marketplace Storage)

### 国际化和工具

- **[next-intl](https://next-intl-docs.vercel.app/)** - Next.js 国际化
- **[next-themes](https://github.com/pacocoursey/next-themes)** - 主题管理
- **[Recharts](https://recharts.org/)** - React 图表库

### 开发工具

- **[Turbopack](https://turbo.build/pack)** - 极速开发构建工具
- **[ESLint 9](https://eslint.org/)** - 代码质量检查
- **[Prettier](https://prettier.io/)** - 代码格式化
- **[Husky](https://typicode.github.io/husky/)** - Git hooks
- **[lint-staged](https://github.com/okonet/lint-staged)** - 暂存文件检查
- **[Commitlint](https://commitlint.js.org/)** - 提交信息规范

### 测试 (可选)

- **[Vitest](https://vitest.dev/)** - 单元测试框架
- **[React Testing Library](https://testing-library.com/react)** - React 组件测试
- **[Playwright](https://playwright.dev/)** - E2E 测试

---

## 🚀 **快速开始**

### 环境要求

- **Node.js**: 20.0.0 或更高版本
- **npm**: 10.0.0 或更高版本

### 安装步骤

1. **克隆项目**

```bash
git clone https://github.com/024812/shaking-head-news.git
cd shaking-head-news
```

2. **安装依赖**

```bash
npm install
```

3. **配置环境变量**

```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件，填入以下必需的环境变量：

```env
# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000

# NextAuth.js
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Microsoft Entra ID (Optional)
AUTH_MICROSOFT_ENTRA_ID_ID=your-microsoft-client-id
AUTH_MICROSOFT_ENTRA_ID_SECRET=your-microsoft-client-secret
AUTH_MICROSOFT_ENTRA_ID_TENANT_ID=your-microsoft-tenant-id

# Upstash Redis (Vercel Marketplace Storage)
UPSTASH_REDIS_REST_URL=your-upstash-redis-rest-url
UPSTASH_REDIS_REST_TOKEN=your-upstash-redis-rest-token

# 新闻 API
NEWS_API_BASE_URL=https://news.ravelloh.top
```

4. **启动开发服务器**

```bash
npm run dev
```

应用将在 [http://localhost:3000](http://localhost:3000) 启动。

### 开发命令

```bash
# 开发模式 (使用 Turbopack)
npm run dev

# 生产构建
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint

# 修复代码问题
npm run lint:fix

# TypeScript 类型检查
npm run type-check

# 代码格式化
npm run format

# 检查代码格式
npm run format:check

# 运行测试 (可选)
npm run test

# 运行测试并生成覆盖率
npm run test:coverage

# 运行 E2E 测试
npm run test:e2e

# 分析包体积
npm run build:analyze
```

---

## 📦 **项目结构**

```
shaking-head-news/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # 认证相关路由
│   │   └── login/                # 登录页面
│   ├── (main)/                   # 主应用路由
│   │   ├── rss/                  # RSS 管理页面
│   │   ├── settings/             # 设置页面
│   │   └── stats/                # 统计页面
│   ├── api/                      # API 路由
│   │   └── auth/                 # NextAuth.js API
│   ├── layout.tsx                # 根布局
│   ├── page.tsx                  # 首页
│   ├── error.tsx                 # 错误页面
│   ├── not-found.tsx             # 404 页面
│   └── providers.tsx             # 全局 Providers
├── components/                   # React 组件
│   ├── ui/                       # Shadcn/ui 基础组件
│   ├── layout/                   # 布局组件
│   │   ├── header.tsx            # 页头
│   │   └── footer.tsx            # 页脚
│   ├── news/                     # 新闻相关组件
│   │   ├── NewsDisplay.tsx       # 新闻展示
│   │   ├── NewsItem.tsx          # 新闻项
│   │   └── RefreshButton.tsx    # 刷新按钮
│   ├── rotation/                 # 旋转相关组件
│   │   ├── TiltWrapper.tsx       # 旋转包装器
│   │   └── RotationControls.tsx # 旋转控制
│   ├── settings/                 # 设置相关组件
│   │   ├── SettingsPanel.tsx     # 设置面板
│   │   └── LanguageSelector.tsx  # 语言选择器
│   ├── stats/                    # 统计相关组件
│   │   ├── StatsDisplay.tsx      # 统计展示
│   │   ├── StatsChart.tsx        # 统计图表
│   │   └── HealthReminder.tsx    # 健康提醒
│   └── rss/                      # RSS 相关组件
│       ├── RSSSourceList.tsx     # RSS 源列表
│       ├── AddRSSSourceDialog.tsx # 添加 RSS 对话框
│       └── ExportOPMLButton.tsx  # OPML 导出按钮
├── lib/                          # 核心库
│   ├── actions/                  # Server Actions
│   │   ├── news.ts               # 新闻操作
│   │   ├── settings.ts           # 设置操作
│   │   ├── stats.ts              # 统计操作
│   │   └── rss.ts                # RSS 操作
│   ├── stores/                   # Zustand 状态管理
│   │   └── rotation-store.ts     # 旋转状态
│   ├── utils/                    # 工具函数
│   │   ├── error-handler.ts      # 错误处理
│   │   ├── input-validation.ts   # 输入验证
│   │   └── performance.ts        # 性能工具
│   ├── auth.ts                   # NextAuth.js 配置
│   ├── storage.ts                # Upstash Redis 客户端
│   ├── rate-limit.ts             # 速率限制
│   └── i18n.ts                   # 国际化配置
├── types/                        # TypeScript 类型定义
│   ├── news.ts                   # 新闻类型
│   ├── settings.ts               # 设置类型
│   ├── stats.ts                  # 统计类型
│   └── rss.ts                    # RSS 类型
├── messages/                     # 国际化翻译文件
│   ├── zh.json                   # 中文翻译
│   └── en.json                   # 英文翻译
├── public/                       # 静态资源
│   ├── icons/                    # 图标
│   └── images/                   # 图片
├── docs/                         # 文档
│   ├── SETUP.md                  # 设置指南
│   ├── MIGRATION_CLEANUP.md      # 迁移清理指南
│   ├── PERFORMANCE_GUIDE.md      # 性能指南
│   └── PRE_DEPLOYMENT_CHECKLIST.md # 部署前检查清单
├── .kiro/                        # Kiro AI 规范文档
│   └── specs/                    # 技术规范
│       └── tech-stack-upgrade/   # 技术栈升级规范
│           ├── requirements.md   # 需求文档
│           ├── design.md         # 设计文档
│           ├── tasks.md          # 任务列表
│           └── SECURITY_IMPLEMENTATION.md # 安全实施指南
├── next.config.js                # Next.js 配置
├── tailwind.config.ts            # Tailwind CSS 配置
├── tsconfig.json                 # TypeScript 配置
├── proxy.ts                      # 中间件 (认证和安全)
└── package.json                  # 项目配置
```

---

## 🔧 **配置说明**

### Google OAuth 配置

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Google+ API
4. 创建 OAuth 2.0 客户端 ID
5. 添加授权重定向 URI：
   - 开发环境: `http://localhost:3000/api/auth/callback/google`
   - 生产环境: `https://your-domain.com/api/auth/callback/google`
6. 复制客户端 ID 和客户端密钥到 `.env.local`

### Microsoft Entra ID 配置 (可选)

1. 访问 [Azure Portal](https://portal.azure.com/)
2. 搜索并进入 "Microsoft Entra ID"
3. 点击 "App registrations" -> "New registration"
4. 配置应用:
   - Name: Shaking Head News
   - Supported account types: Accounts in any organizational directory (Any Microsoft Entra ID tenant - Multitenant) and personal Microsoft accounts (e.g. Skype, Xbox)
   - Redirect URI: Web - `http://localhost:3000/api/auth/callback/microsoft-entra-id`
5. 创建后，复制 "Application (client) ID" 和 "Directory (tenant) ID" 到 `.env.local`
6. 在 "Certificates & secrets" 中创建新的 Client Secret，并复制 Value 到 `.env.local`

### Upstash Redis 配置

1. 访问 [Upstash Console](https://console.upstash.com/)
2. 创建新的 Redis 数据库
3. 选择区域（推荐：香港或新加坡）
4. 复制 REST URL 和 REST Token 到 `.env.local`

或者在 Vercel 部署时：

1. 在 Vercel 项目设置中
2. 进入 "Storage" 标签
3. 添加 Upstash Redis (Vercel Marketplace Storage)
4. 环境变量会自动配置

---

## 🔒 **隐私和安全**

### 已实施的安全措施

- ✅ **Content Security Policy (CSP)**: 防止 XSS 攻击
- ✅ **速率限制**: 4 个层级的速率限制，防止滥用
- ✅ **输入验证**: 所有用户输入都经过验证和清理
- ✅ **CORS 配置**: 严格的跨域资源共享策略
- ✅ **用户权限验证**: 所有 Server Actions 都验证用户权限
- ✅ **XSS 防护**: 输入清理和 CSP headers
- ✅ **CSRF 防护**: NextAuth.js 内置 CSRF 保护
- ✅ **SQL 注入防护**: 使用 Zod 验证和参数化查询

### 数据隐私

- **最小数据收集**: 仅收集必要的用户设置和统计数据
- **本地优先**: 未登录用户的设置仅存储在本地
- **云端加密**: 用户数据在 Upstash Redis 中加密存储
- **不追踪**: 不使用第三方追踪工具
- **可删除**: 用户可随时删除自己的数据

详细的安全实施文档请参考：[SECURITY_IMPLEMENTATION.md](.kiro/specs/tech-stack-upgrade/SECURITY_IMPLEMENTATION.md)

---

## 🚀 **部署**

### Vercel 部署 (推荐)

1. **Fork 本项目到你的 GitHub 账号**

2. **在 Vercel 中导入项目**
   - 访问 [Vercel](https://vercel.com/)
   - 点击 "New Project"
   - 导入你的 GitHub 仓库

3. **配置环境变量**
   - 在 Vercel 项目设置中添加所有必需的环境变量
   - 参考 `.env.example` 文件

4. **添加 Upstash Redis**
   - 在 Vercel 项目设置中
   - 进入 "Storage" 标签
   - 添加 Upstash Redis
   - 环境变量会自动配置

5. **配置 CI/CD**
   - 参考 [CI/CD 设置指南](.github/ACTIONS_SETUP.md)
   - 配置 GitHub Secrets (VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID)
   - 推送代码会自动触发 CI/CD 流程

6. **部署**
   - Vercel 会自动构建和部署
   - 每次推送到主分支都会自动部署
   - Pull Request 会自动创建预览部署

### 自定义域名

1. 在 Vercel 项目设置中添加自定义域名
2. 配置 DNS 记录指向 Vercel
3. SSL 证书会自动配置
4. 更新 Google OAuth 回调 URL
5. 更新 Microsoft Entra ID 回调 URL (如果使用)

### 环境变量配置

在 Vercel 项目设置中配置以下环境变量：

```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.com
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
AUTH_MICROSOFT_ENTRA_ID_ID=your-microsoft-id
AUTH_MICROSOFT_ENTRA_ID_SECRET=your-microsoft-secret
AUTH_MICROSOFT_ENTRA_ID_TENANT_ID=your-microsoft-tenant-id
UPSTASH_REDIS_REST_URL=your-upstash-url
UPSTASH_REDIS_REST_TOKEN=your-upstash-token
NEWS_API_BASE_URL=https://news.ravelloh.top
```

详细的部署检查清单请参考：[PRE_DEPLOYMENT_CHECKLIST.md](docs/PRE_DEPLOYMENT_CHECKLIST.md)

---

## 🧪 **测试**

### 运行测试

```bash
# 运行所有测试
npm run test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行 E2E 测试
npm run test:e2e
```

### 测试覆盖率目标

- 单元测试覆盖率: 70%+
- Server Actions: 100%
- 关键用户流程: E2E 测试覆盖

---

## 📊 **性能优化**

### 已实施的优化措施

- ✅ **ISR 缓存**: 新闻内容使用 ISR，1 小时重新验证
- ✅ **图片优化**: Next.js Image 组件自动优化
- ✅ **代码分割**: 动态导入重型组件
- ✅ **字体优化**: 字体预加载和子集化
- ✅ **DNS 预取**: 预连接到外部域名
- ✅ **Bundle 分析**: 使用 @next/bundle-analyzer 分析包体积

---

## 📈 **监控和日志**

### 监控功能

应用内置了完整的监控和日志系统：

- **错误监控**: Sentry 集成，实时错误追踪和性能监控
- **用户分析**: Google Analytics 和 Vercel Analytics 支持
- **性能监控**: Web Vitals 自动追踪 (LCP, FID, CLS, etc.)
- **结构化日志**: 多级别日志系统，支持开发和生产环境

### 快速设置

```bash
# 运行监控设置脚本 (Windows)
.\scripts\setup-monitoring.ps1
```

### 环境变量配置

```env
# Sentry (可选)
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id

# Google Analytics (可选)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# 日志级别 (可选)
NEXT_PUBLIC_LOG_LEVEL=info
```

### 使用示例

```typescript
import { logger } from '@/lib/logger'
import { trackEvent } from '@/lib/analytics'
import { captureException } from '@/lib/sentry'

// 记录日志
logger.info('User action', { userId: '123' })

// 追踪事件
trackEvent({
  action: 'click',
  category: 'button',
  label: 'refresh',
})

// 捕获错误
try {
  await riskyOperation()
} catch (error) {
  captureException(error)
}
```

### 文档

- **快速开始**: [MONITORING_QUICK_START.md](docs/MONITORING_QUICK_START.md)
- **完整文档**: [MONITORING_AND_LOGGING.md](.kiro/specs/tech-stack-upgrade/MONITORING_AND_LOGGING.md)

### 性能指标

- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1
- **TTI (Time to Interactive)**: < 3.5s

详细的性能指南请参考：[PERFORMANCE_GUIDE.md](docs/PERFORMANCE_GUIDE.md)

---

## 🤝 **贡献指南**

我们欢迎所有形式的贡献！

### 贡献流程

1. **Fork 本项目**
2. **创建功能分支**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **提交更改**
   ```bash
   git commit -m 'feat: add some amazing feature'
   ```
4. **推送到分支**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **创建 Pull Request**

### 提交信息规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具相关

### 代码规范

- 遵循 ESLint 和 Prettier 配置
- 编写有意义的提交信息
- 添加必要的注释和文档
- 确保所有测试通过
- 保持代码覆盖率

---

## 📄 **开源协议**

本项目基于 [MPL-2.0](LICENSE) 协议开源。

---

## 🙏 **致谢**

### 数据源

- 新闻数据来源：[EverydayNews](https://github.com/ravelloh/everydaynews)
- 感谢 [@ravelloh](https://github.com/ravelloh) 提供的每日新闻 API

### 技术栈

- [Next.js](https://nextjs.org/) - React 框架
- [Vercel](https://vercel.com/) - 部署平台
- [Shadcn/ui](https://ui.shadcn.com/) - UI 组件库
- [Upstash](https://upstash.com/) - Serverless Redis

---

## 📞 **联系方式**

- **作者**: 024812
- **Email**: 024812@users.noreply.github.com
- **GitHub**: [@024812](https://github.com/024812)
- **项目主页**: [https://github.com/024812/shaking-head-news](https://github.com/024812/shaking-head-news)

---

## 🗺️ **路线图**

### 已完成 ✅

- [x] Next.js 16 + React 19.2 迁移
- [x] Tailwind CSS 4.1 升级
- [x] 用户认证和云同步（使用稳定的用户标识符）
- [x] 多语言支持（中英文）
- [x] RSS 源管理（OPML 导入/导出）
- [x] 统计数据和健康提醒
- [x] 性能优化（ISR、图片优化、代码分割）
- [x] 安全加固（CSP、速率限制、输入验证）
- [x] 设置页面旋转禁用
- [x] 主题切换优化
- [x] CSS 加载修复（PostCSS 配置优化）

### 计划中 🚧

- [ ] PWA 支持
- [ ] 移动端 App
- [ ] 更多新闻源
- [ ] 社交分享功能
- [ ] 用户社区
- [ ] AI 新闻摘要

---

## 📚 **相关文档**

- [设置指南](docs/SETUP.md)
- [迁移清理指南](docs/MIGRATION_CLEANUP.md)
- [性能指南](docs/PERFORMANCE_GUIDE.md)
- [部署前检查清单](docs/PRE_DEPLOYMENT_CHECKLIST.md)
- [安全实施指南](.kiro/specs/tech-stack-upgrade/SECURITY_IMPLEMENTATION.md)
- [需求文档](.kiro/specs/tech-stack-upgrade/requirements.md)
- [设计文档](.kiro/specs/tech-stack-upgrade/design.md)
- [任务列表](.kiro/specs/tech-stack-upgrade/tasks.md)

---

**把摇头叹息变成健康摇头，让看新闻成为一种颈椎运动！** 📰🤸‍♂️

<p align="center">Made with ❤️ by 024812</p>
