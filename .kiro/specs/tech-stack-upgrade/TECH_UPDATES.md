# 技术栈更新说明

## 更新日期
2025年11月12日

## 更新原因
根据 Vercel 官方公告，以下技术已经更新或被替代：

1. **Vercel KV → Vercel Marketplace Storage** (2025年6月9日起)
   - 提供自动账户配置和统一计费
   - API 保持兼容，但推荐使用新的命名

2. **middleware.ts → proxy.ts**
   - middleware 文件约定已被弃用
   - 新的 proxy.ts 文件提供相同功能

## 更新内容

### 1. 需求文档更新
- ✅ 将所有 "Vercel KV" 引用替换为 "Vercel Marketplace Storage"
- ✅ 将 "KV 存储" 术语更新为 "Marketplace Storage"
- ✅ 更新测试相关需求中的存储引用

### 2. 设计文档更新
- ✅ 更新架构图中的存储层命名
- ✅ 将 `lib/kv.ts` 更新为 `lib/storage.ts`
- ✅ 将 `middleware.ts` 更新为 `proxy.ts`
- ✅ 更新所有代码示例中的导入语句
- ✅ 添加 Vercel Marketplace Storage 配置示例
- ✅ 更新环境变量命名：
  - `KV_REST_API_URL` → `UPSTASH_REDIS_REST_URL`
  - `KV_REST_API_TOKEN` → `UPSTASH_REDIS_REST_TOKEN`
- ✅ 使用 `@upstash/redis` 包（Vercel Marketplace Storage 的底层实现）

### 3. 任务列表更新
- ✅ Task 3: "Vercel KV 和认证配置" → "Vercel Marketplace Storage 和认证配置"
- ✅ 更新任务描述中的文件名和技术引用
- ✅ 更新测试任务中的 Mock 对象引用

### 4. 目录结构更新
```
变更前:
├── lib/
│   ├── kv.ts                     # Vercel KV 客户端
│   └── services/
│       └── kv-service.ts         # KV 存储服务
├── middleware.ts                 # Next.js 中间件

变更后:
├── lib/
│   ├── storage.ts                # Vercel Marketplace Storage 客户端
│   └── services/
│       └── storage-service.ts    # Storage 存储服务
├── proxy.ts                      # Next.js 代理文件
```

## API 变更

### 导入语句
```typescript
// 旧方式
import { kv } from '@/lib/kv'

// 新方式（使用 Upstash Redis）
import { storage } from '@/lib/storage'
// 或直接使用
import { Redis } from '@upstash/redis'
```

### 使用方式
```typescript
// API 保持兼容（Upstash Redis API）
await storage.get(key)
await storage.set(key, value)
await storage.del(key)
await storage.expire(key, seconds)
```

### 包依赖
```json
{
  "dependencies": {
    "@upstash/redis": "^1.28.0"
  }
}
```

### 环境变量
```bash
# 旧方式
KV_REST_API_URL=...
KV_REST_API_TOKEN=...

# 新方式（使用 Upstash Redis）
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

## 迁移影响

### 低风险
- API 接口保持兼容
- 主要是命名和文件位置的变更
- 不影响核心功能实现

### 需要注意
1. 更新环境变量配置
2. 更新 Vercel 项目设置中的集成配置
3. 更新 CI/CD 配置中的环境变量引用

## Docker 兼容性考虑

虽然当前阶段主要使用 Vercel 部署，但设计文档中已添加 Docker 配置说明，确保未来可以无缝迁移到容器化环境。

### 关键设计原则
1. **环境变量驱动** - 所有配置通过环境变量注入
2. **无状态设计** - 应用不存储本地状态，支持水平扩展
3. **健康检查** - 提供 `/api/health` 端点
4. **日志标准化** - 输出到 stdout/stderr
5. **Next.js Standalone 模式** - 支持独立部署

### Docker 配置文件（已准备）
- ✅ Dockerfile（生产环境）
- ✅ Dockerfile.dev（开发环境）
- ✅ docker-compose.yml
- ✅ docker-compose.dev.yml
- ✅ .dockerignore
- ✅ 健康检查端点示例

**注意：** 这些配置文件暂不需要实现，仅作为未来迁移的参考。

## 后续步骤

1. ✅ 文档已全部更新
2. ✅ Docker 兼容性已在设计中考虑
3. ⏳ 开始实现 Task 3 时使用新的命名
4. ⏳ 部署前确认 Vercel Marketplace Storage 已正确配置
5. ⏳ 更新 .env.example 文件

## 参考资料

- [Vercel Marketplace Storage 公告](https://vercel.com/docs/storage)
- [Next.js Proxy 迁移指南](https://nextjs.org/docs/app/building-your-application/routing/middleware)
