# Design Document: UI Theme Optimization (Soft UI Evolution)

## Overview

本设计文档定义了"摇头看新闻"应用采用 Soft UI Evolution 主题的具体实现方案。该设计风格结合了现代美学、柔和阴影和改进的对比度，特别适合健康/wellness类应用。

### 设计原则

1. **柔和深度** - 使用改进的阴影系统，比扁平设计更有层次，但比拟物化设计更柔和
2. **健康配色** - 以绿色和蓝色为主调，传达健康、信任和平静
3. **无障碍优先** - 确保 WCAG AA+ 对比度标准
4. **响应式动画** - 200-300ms 过渡，尊重用户的动效偏好

## Architecture

### 主题系统架构

```
┌─────────────────────────────────────────────────────────┐
│                    Theme Provider                        │
│                  (next-themes)                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │ Light Mode  │    │ Dark Mode   │    │ System Mode │ │
│  │ CSS Vars    │    │ CSS Vars    │    │ (Auto)      │ │
│  └─────────────┘    └─────────────┘    └─────────────┘ │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                    CSS Variables                         │
│  (globals.css - Color Tokens, Shadows, Animations)      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │ Components  │    │ Layouts     │    │ Pages       │ │
│  │ (shadcn/ui) │    │ (Header,    │    │ (Home,      │ │
│  │             │    │  Footer)    │    │  Settings)  │ │
│  └─────────────┘    └─────────────┘    └─────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. 配色系统 (Color System)

#### Light Mode 配色

```css
:root {
  /* 背景色 */
  --background: 210 40% 98%; /* #F8FAFC - 柔和白 */
  --foreground: 222.2 84% 4.9%; /* #0F172A - 深色文字 */

  /* 卡片和弹出层 */
  --card: 0 0% 100%; /* #FFFFFF */
  --card-foreground: 222.2 84% 4.9%; /* #0F172A */

  /* 主色调 - 健康绿 */
  --primary: 160 84% 39%; /* #10B981 - Emerald 500 */
  --primary-foreground: 0 0% 100%; /* #FFFFFF */

  /* 次要色 - 信任蓝 */
  --secondary: 217 91% 60%; /* #3B82F6 - Blue 500 */
  --secondary-foreground: 0 0% 100%; /* #FFFFFF */

  /* 强调色 */
  --accent: 210 40% 96%; /* #F1F5F9 - Slate 100 */
  --accent-foreground: 222.2 47% 11%; /* #1E293B */

  /* 静音色 */
  --muted: 210 40% 96%; /* #F1F5F9 */
  --muted-foreground: 215 16% 47%; /* #64748B - Slate 500 */

  /* 边框和输入框 */
  --border: 214 32% 91%; /* #E2E8F0 - Slate 200 */
  --input: 214 32% 91%;
  --ring: 160 84% 39%; /* 与 primary 一致 */
}
```

#### Dark Mode 配色

```css
.dark {
  /* 背景色 */
  --background: 222 84% 5%; /* #0F172A - Slate 900 */
  --foreground: 210 40% 98%; /* #F8FAFC */

  /* 卡片和弹出层 */
  --card: 217 33% 17%; /* #1E293B - Slate 800 */
  --card-foreground: 210 40% 98%; /* #F8FAFC */

  /* 主色调 - 健康绿 (稍亮) */
  --primary: 160 84% 45%; /* #34D399 - Emerald 400 */
  --primary-foreground: 222 84% 5%; /* #0F172A */

  /* 次要色 - 信任蓝 (稍亮) */
  --secondary: 217 91% 65%; /* #60A5FA - Blue 400 */
  --secondary-foreground: 222 84% 5%; /* #0F172A */

  /* 强调色 */
  --accent: 217 33% 17%; /* #1E293B */
  --accent-foreground: 210 40% 98%; /* #F8FAFC */

  /* 静音色 */
  --muted: 217 33% 17%; /* #1E293B */
  --muted-foreground: 215 20% 65%; /* #94A3B8 - Slate 400 */

  /* 边框和输入框 */
  --border: 217 33% 25%; /* #334155 - Slate 700 */
  --input: 217 33% 25%;
  --ring: 160 84% 45%;
}
```

### 2. 阴影系统 (Shadow System)

```css
@theme {
  /* 柔和阴影 - Soft UI Evolution 风格 */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.03), 0 1px 3px 0 rgb(0 0 0 / 0.05);

  --shadow-md: 0 2px 4px -1px rgb(0 0 0 / 0.04), 0 4px 6px -1px rgb(0 0 0 / 0.06);

  --shadow-lg: 0 4px 6px -2px rgb(0 0 0 / 0.03), 0 10px 15px -3px rgb(0 0 0 / 0.08);

  /* 悬停增强阴影 */
  --shadow-hover: 0 8px 16px -4px rgb(0 0 0 / 0.08), 0 4px 8px -2px rgb(0 0 0 / 0.04);

  /* 深色模式阴影 */
  --shadow-dark-sm: 0 1px 2px 0 rgb(0 0 0 / 0.2);
  --shadow-dark-md: 0 4px 6px -1px rgb(0 0 0 / 0.3);
  --shadow-dark-lg: 0 10px 15px -3px rgb(0 0 0 / 0.4);
}
```

### 3. News Card 组件设计

```tsx
// components/news/NewsItem.tsx
interface NewsCardProps {
  item: NewsItemType
}

// 样式类定义
const cardClasses = cn(
  // 基础样式
  'rounded-xl border bg-card p-4',
  // 阴影
  'shadow-sm',
  // 过渡动画
  'transition-all duration-200 ease-out',
  // 悬停效果
  'hover:shadow-hover hover:scale-[1.01]',
  // 交互指示
  'cursor-pointer',
  // 深色模式
  'dark:border-border dark:bg-card'
)
```

### 4. Header 组件设计

```tsx
// components/layout/header.tsx
const headerClasses = cn(
  // 定位
  'sticky top-0 z-50 w-full',
  // 背景和毛玻璃效果
  'bg-background/80 backdrop-blur-md',
  // 边框
  'border-b border-border',
  // 过渡
  'transition-colors duration-200'
)

const navLinkClasses = cn(
  'text-sm font-medium',
  'text-muted-foreground',
  'transition-colors duration-200',
  'hover:text-primary'
)
```

### 5. Button 组件变体

```tsx
// 主要按钮 - 健康绿
const primaryButton = cn(
  'bg-primary text-primary-foreground',
  'hover:bg-primary/90',
  'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
  'transition-colors duration-200',
  'rounded-lg'
)

// 次要按钮
const secondaryButton = cn(
  'bg-secondary text-secondary-foreground',
  'hover:bg-secondary/90',
  'focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2',
  'transition-colors duration-200',
  'rounded-lg'
)

// 轮廓按钮
const outlineButton = cn(
  'border border-input bg-background',
  'hover:bg-accent hover:text-accent-foreground',
  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  'transition-colors duration-200',
  'rounded-lg'
)
```

## Data Models

### 主题配置类型

```typescript
// types/theme.ts
interface ThemeConfig {
  colors: {
    light: ColorTokens
    dark: ColorTokens
  }
  shadows: ShadowTokens
  animations: AnimationConfig
  typography: TypographyConfig
}

interface ColorTokens {
  background: string
  foreground: string
  card: string
  cardForeground: string
  primary: string
  primaryForeground: string
  secondary: string
  secondaryForeground: string
  muted: string
  mutedForeground: string
  accent: string
  accentForeground: string
  border: string
  input: string
  ring: string
}

interface ShadowTokens {
  sm: string
  md: string
  lg: string
  hover: string
}

interface AnimationConfig {
  duration: {
    fast: string // 150ms
    normal: string // 200ms
    slow: string // 300ms
  }
  easing: {
    enter: string // ease-out
    exit: string // ease-in
    default: string // ease-in-out
  }
}

interface TypographyConfig {
  fontFamily: {
    sans: string[]
    mono: string[]
  }
  fontSize: Record<string, [string, { lineHeight: string }]>
  fontWeight: Record<string, string>
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: WCAG Contrast Ratio Compliance

_For any_ text color and background color combination defined in the Theme_System (both light and dark modes), the contrast ratio SHALL be at least 4.5:1 for normal text and 3:1 for large text, ensuring WCAG AA compliance.

**Validates: Requirements 1.6, 4.2, 8.1**

### Property 2: Theme Consistency

_For any_ color token defined in the light mode theme, there SHALL exist a corresponding token in the dark mode theme with appropriate contrast adjustments.

**Validates: Requirements 1.4, 1.5, 8.2, 8.3**

## Error Handling

### 字体加载失败

```typescript
// 字体加载失败时的回退策略
const fontFamily = {
  sans: [
    'Inter',
    'Noto Sans SC',
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'sans-serif',
  ],
}
```

### 主题切换错误

```typescript
// 主题切换时的错误处理
try {
  setTheme(newTheme)
} catch (error) {
  console.error('Theme switch failed:', error)
  // 回退到系统主题
  setTheme('system')
}
```

## Testing Strategy

### 单元测试

1. **颜色对比度测试** - 验证所有颜色组合满足 WCAG AA 标准
2. **CSS 变量测试** - 验证所有必需的 CSS 变量已定义
3. **组件样式测试** - 验证组件应用了正确的样式类

### 属性测试

1. **对比度属性测试** - 使用 fast-check 生成颜色组合，验证对比度
2. **主题一致性测试** - 验证 light/dark 模式的令牌对应关系

### 视觉回归测试

1. **Playwright 截图对比** - 验证组件在不同主题下的视觉一致性
2. **响应式测试** - 验证不同视口下的布局正确性

### 测试框架配置

```typescript
// vitest.config.ts 中添加
export default defineConfig({
  test: {
    // 属性测试配置
    testTimeout: 30000, // 属性测试可能需要更长时间
  },
})
```

### 属性测试示例

```typescript
// tests/theme.property.test.ts
import { fc } from '@fast-check/vitest'
import { getContrastRatio } from '@/lib/utils/color'

// Property 1: WCAG Contrast Ratio Compliance
// Feature: ui-theme-optimization, Property 1: WCAG Contrast Ratio Compliance
describe('Theme Contrast Properties', () => {
  it.prop([fc.hexaString()])('all text colors have sufficient contrast', (colorHex) => {
    // 测试实现
  })
})
```
