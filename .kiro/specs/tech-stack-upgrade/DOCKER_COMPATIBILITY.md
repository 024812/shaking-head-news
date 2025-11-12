# Docker 兼容性设计说明

## 概述

本文档说明应用设计中如何考虑 Docker 容器化的兼容性，确保未来可以无缝迁移到 Docker 环境。

## 当前状态

- **主要部署方式：** Vercel
- **Docker 支持：** 设计阶段已考虑，配置文件已准备但暂不实现
- **迁移难度：** 低（架构已为容器化做好准备）

## 关键设计原则

### 1. 十二要素应用（12-Factor App）

应用遵循十二要素应用原则，天然适合容器化：

#### ✅ 配置（Config）
```typescript
// 所有配置通过环境变量注入
const config = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL,
  authSecret: process.env.NEXTAUTH_SECRET,
  redisUrl: process.env.UPSTASH_REDIS_REST_URL,
  // 无硬编码配置
}
```

#### ✅ 无状态（Stateless）
- 应用本身不存储状态
- 所有用户数据存储在 Vercel Marketplace Storage（外部服务）
- 支持水平扩展，多实例并行运行

#### ✅ 日志（Logs）
```typescript
// 所有日志输出到 stdout/stderr
console.log('Application started')
console.error('Error occurred:', error)
// 不写入本地文件
```

#### ✅ 端口绑定（Port Binding）
```javascript
// next.config.js
const nextConfig = {
  // 支持环境变量配置端口
  // Docker 可以通过 PORT 环境变量控制
}
```

### 2. 健康检查支持

```typescript
// app/api/health/route.ts
// 提供健康检查端点，便于容器编排
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
}
```

### 3. Next.js Standalone 模式

```javascript
// next.config.js
const nextConfig = {
  output: 'standalone', // 生成独立可部署的应用
  // 减小 Docker 镜像体积
}
```

### 4. 环境变量清单

所有必需的环境变量都有文档化：

```bash
# .env.example
NEXT_PUBLIC_APP_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
NEWS_API_BASE_URL=
```

## 已准备的 Docker 配置

设计文档中包含以下配置文件示例（暂不实现）：

1. **Dockerfile** - 多阶段构建，优化镜像大小
2. **Dockerfile.dev** - 开发环境配置
3. **docker-compose.yml** - 生产环境编排
4. **docker-compose.dev.yml** - 开发环境编排
5. **.dockerignore** - 排除不必要的文件
6. **健康检查端点** - `/api/health`
7. **部署脚本** - 自动化部署流程

## 迁移到 Docker 的步骤

当需要迁移到 Docker 时，只需：

1. **创建配置文件**
   ```bash
   # 从设计文档复制配置文件
   cp design.md/Dockerfile ./Dockerfile
   cp design.md/docker-compose.yml ./docker-compose.yml
   ```

2. **配置环境变量**
   ```bash
   # 创建 .env 文件
   cp .env.example .env
   # 填写实际的环境变量值
   ```

3. **构建和运行**
   ```bash
   docker-compose up -d
   ```

4. **验证部署**
   ```bash
   curl http://localhost:3000/api/health
   ```

## 兼容性检查清单

在实现过程中，确保遵循以下原则：

- [ ] 所有配置通过环境变量注入
- [ ] 不在本地文件系统存储状态
- [ ] 日志输出到 stdout/stderr
- [ ] 提供健康检查端点
- [ ] 支持优雅关闭（graceful shutdown）
- [ ] 不依赖特定的文件系统路径
- [ ] 支持通过环境变量配置端口
- [ ] 外部服务连接可配置（数据库、存储等）

## 注意事项

### Vercel 特定功能

某些 Vercel 特定功能在 Docker 环境中需要替代方案：

1. **Edge Functions** → 使用标准 API Routes
2. **Vercel Analytics** → 使用 Google Analytics 或自建方案
3. **Vercel Cron** → 使用 Kubernetes CronJob 或外部调度器

### 图片优化

```javascript
// next.config.js
const nextConfig = {
  images: {
    // Docker 环境可能需要禁用图片优化
    unoptimized: process.env.DOCKER_BUILD === 'true',
  }
}
```

## 性能考虑

Docker 部署时的性能优化：

1. **多阶段构建** - 减小最终镜像体积
2. **层缓存** - 优化构建速度
3. **非 root 用户** - 提高安全性
4. **健康检查** - 确保容器正常运行
5. **资源限制** - 防止资源耗尽

## 总结

当前设计已充分考虑 Docker 兼容性，应用架构遵循云原生最佳实践。未来迁移到 Docker 环境时，只需添加配置文件即可，无需修改应用代码。

**关键优势：**
- ✅ 无状态设计，支持水平扩展
- ✅ 环境变量驱动，配置灵活
- ✅ 标准化日志输出
- ✅ 健康检查支持
- ✅ 遵循十二要素应用原则

**迁移成本：** 极低（仅需添加配置文件）
