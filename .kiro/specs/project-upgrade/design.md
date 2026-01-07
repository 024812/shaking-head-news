# Design Document: Project Upgrade

## Overview

本设计文档定义了"摇头看新闻"项目全面升级的具体实现方案。升级涵盖依赖版本更新、代码优化、无用文件清理、配置优化和文档更新。

### 升级目标

1. **依赖升级** - 将所有依赖升级到最新稳定版本
2. **Node.js 升级** - 从 Node.js 20.x 升级到 24.x LTS
3. **代码清理** - 删除无用文件和目录
4. **配置优化** - 优化所有配置文件
5. **文档同步** - 更新文档以反映当前状态

## Architecture

### 依赖升级架构

```
┌─────────────────────────────────────────────────────────┐
│                    Package Updates                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │ Runtime     │    │ Framework   │    │ Dev Tools   │ │
│  │ Node.js 24  │    │ Next.js 16  │    │ ESLint 9    │ │
│  │ React 19.2  │    │ Tailwind 4  │    │ Vitest 4    │ │
│  └─────────────┘    └─────────────┘    └─────────────┘ │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                    Configuration                         │
│  (package.json, tsconfig.json, next.config.js)          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │ Build       │    │ Testing     │    │ Deployment  │ │
│  │ Turbopack   │    │ Vitest      │    │ Vercel      │ │
│  │             │    │ Playwright  │    │             │ │
│  └─────────────┘    └─────────────┘    └─────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. 依赖版本升级

#### 生产依赖升级

| Package              | Current  | Target  | Notes      |
| -------------------- | -------- | ------- | ---------- |
| next                 | 16.0.10  | 16.1.1  | 最新稳定版 |
| react                | 19.2.0   | 19.2.3  | 最新稳定版 |
| react-dom            | 19.2.0   | 19.2.3  | 最新稳定版 |
| next-intl            | 4.5.6    | 4.7.0   | 最新稳定版 |
| framer-motion        | 12.23.25 | 12.24.7 | 最新稳定版 |
| lucide-react         | 0.556.0  | 0.562.0 | 最新稳定版 |
| recharts             | 3.4.1    | 3.6.0   | 最新稳定版 |
| zod                  | 4.1.13   | 4.3.5   | 最新稳定版 |
| @upstash/redis       | 1.28.0   | 1.36.0  | 最新稳定版 |
| tailwindcss          | 4.1.17   | 4.1.18  | 最新稳定版 |
| @tailwindcss/postcss | 4.1.17   | 4.1.18  | 最新稳定版 |
| fast-xml-parser      | 5.3.2    | 5.3.3   | 最新稳定版 |

#### 开发依赖升级

| Package                         | Current | Target  | Notes                                      |
| ------------------------------- | ------- | ------- | ------------------------------------------ |
| @types/node                     | 24.10.1 | 24.10.4 | Node.js 24 类型                            |
| @next/bundle-analyzer           | 16.0.6  | 16.1.1  | 匹配 Next.js 版本                          |
| eslint                          | 9.21.0  | 9.39.2  | 最新稳定版                                 |
| eslint-config-next              | 16.0.7  | 16.1.1  | 匹配 Next.js 版本 (包含 typescript-eslint) |
| @commitlint/cli                 | 20.2.0  | 20.3.0  | 最新稳定版                                 |
| @commitlint/config-conventional | 20.2.0  | 20.3.0  | 最新稳定版                                 |
| vitest                          | 4.0.15  | 4.0.16  | 最新稳定版                                 |
| @vitejs/plugin-react            | 5.1.1   | 5.1.2   | 最新稳定版                                 |
| @testing-library/react          | 16.1.0  | 16.3.1  | 最新稳定版                                 |
| jsdom                           | 27.2.0  | 27.4.0  | 最新稳定版                                 |
| autoprefixer                    | 10.4.20 | 10.4.23 | 最新稳定版                                 |

> Note: `@typescript-eslint/eslint-plugin` 和 `@typescript-eslint/parser` 已移除，因为它们通过 `eslint-config-next` 的 `typescript-eslint` 依赖自动提供。

### 2. Node.js 版本升级

```json
// package.json - engines 字段更新
{
  "engines": {
    "node": "24.x"
  }
}
```

### 3. 无用文件清理

#### 需要删除的文件/目录

| Path       | Reason                                 |
| ---------- | -------------------------------------- |
| `.shared/` | 未被项目使用的外部数据目录             |
| `src/`     | tsconfig.json 中排除但不存在的目录引用 |
| `dist/`    | 构建输出目录引用但不存在               |
| `out/`     | 构建输出目录引用但不存在               |

#### 需要清理的配置引用

- `tsconfig.json` 中的 `exclude` 数组包含不存在的目录
- `eslint.config.js` 中的 `ignores` 包含不存在的目录

### 4. 配置文件优化

#### next.config.js 优化

```javascript
// 启用 Turbopack 文件系统缓存
experimental: {
  turbopackFileSystemCacheForDev: true,
}
```

#### package.json 优化

```json
{
  "engines": {
    "node": "24.x"
  },
  "scripts": {
    "prepare": "husky || true" // 已正确处理非 git 环境
  }
}
```

### 5. Favicon 添加

需要在 `public/` 目录添加 `favicon.ico` 文件，从现有的 `favicon.png` 或 `favicon.svg` 生成。

## Data Models

### 升级配置类型

```typescript
interface UpgradeConfig {
  dependencies: {
    production: Record<string, string>
    development: Record<string, string>
  }
  nodeVersion: string
  filesToRemove: string[]
  configUpdates: ConfigUpdate[]
}

interface ConfigUpdate {
  file: string
  changes: Record<string, unknown>
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Build Success After Upgrade

_For any_ valid project state after dependency upgrades, running `npm run build` SHALL complete without errors, ensuring all upgraded packages are compatible.

**Validates: Requirements 1.3, 6.3, 7.1**

### Property 2: Test Suite Integrity

_For any_ test file in the test suite, all imports SHALL resolve to existing source files, and running `npm test` SHALL complete with all tests passing.

**Validates: Requirements 6.1, 6.2, 6.3**

### Property 3: No Security Vulnerabilities

_For any_ dependency in the project, running `npm audit` SHALL report no high or critical severity vulnerabilities.

**Validates: Requirements 8.1, 8.4**

## Error Handling

### 依赖升级失败

```typescript
// 如果升级导致构建失败，回滚到之前的版本
try {
  await runBuild()
} catch (error) {
  console.error('Build failed after upgrade:', error)
  // 回滚 package.json
  await restorePackageJson()
}
```

### 文件删除保护

```typescript
// 删除文件前确认文件未被引用
async function safeDelete(path: string) {
  const references = await findReferences(path)
  if (references.length > 0) {
    console.warn(`File ${path} is still referenced:`, references)
    return false
  }
  await fs.rm(path, { recursive: true })
  return true
}
```

## Testing Strategy

### 单元测试

1. **配置验证测试** - 验证所有配置文件格式正确
2. **依赖版本测试** - 验证 package.json 中的版本符合预期
3. **文件存在性测试** - 验证必需文件存在，无用文件已删除

### 集成测试

1. **构建测试** - 验证 `npm run build` 成功完成
2. **类型检查测试** - 验证 `npm run type-check` 无错误
3. **Lint 测试** - 验证 `npm run lint` 无错误

### 属性测试

使用 Vitest 和 fast-check 进行属性测试：

```typescript
// tests/unit/upgrade/upgrade.property.test.ts
import { fc } from '@fast-check/vitest'

// Property 1: Build Success After Upgrade
// Feature: project-upgrade, Property 1: Build Success After Upgrade
describe('Upgrade Properties', () => {
  it('build should succeed after upgrade', async () => {
    // 运行构建并验证成功
  })
})
```

### 测试框架配置

- **Vitest** - 单元测试和属性测试
- **Playwright** - E2E 测试
- **最小 100 次迭代** - 属性测试配置
