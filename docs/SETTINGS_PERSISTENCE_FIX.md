# 设置持久化修复

## 问题描述

用户在设置页面保存设置后，登出再登录，设置没有保留。

## 根本原因

1. **不稳定的用户ID**: 之前使用NextAuth自动生成的`user.id`，这个ID在JWT策略下可能不稳定
2. **缺少Redis配置**: Vercel生产环境可能没有配置Upstash Redis，导致使用内存存储（重启后数据丢失）

## 解决方案

### 1. 使用稳定的用户标识符

修改 `lib/auth.ts`，使用Google提供的稳定标识符：

- 优先使用 `account.providerAccountId` (Google的sub)
- 备选使用 `user.email`
- 最后才使用 `user.id`

```typescript
async jwt({ token, user, account }) {
  // 使用Google的sub作为稳定的用户ID
  if (user) {
    token.id = account?.providerAccountId || user.email || user.id
  }
  return token
}
```

### 2. 配置Upstash Redis

在Vercel项目中配置环境变量：

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择项目 > Settings > Environment Variables
3. 添加以下变量：

```bash
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

#### 获取Redis凭证

**方法1: 通过Vercel Marketplace**

1. 在Vercel Dashboard中，进入 Storage 标签
2. 点击 "Create Database"
3. 选择 "KV (Redis)" powered by Upstash
4. 创建后，凭证会自动添加到环境变量

**方法2: 直接使用Upstash**

1. 访问 [Upstash Console](https://console.upstash.com/)
2. 创建新的Redis数据库
3. 复制 REST URL 和 REST Token
4. 手动添加到Vercel环境变量

### 3. 重新部署

配置环境变量后，触发重新部署：

```bash
git commit --allow-empty -m "chore: trigger redeploy for env vars"
git push
```

## 验证修复

1. 登录应用
2. 修改设置（如字体大小、主题等）
3. 保存设置
4. 登出
5. 重新登录
6. 检查设置是否保留

## 技术细节

### 用户ID生成逻辑

```typescript
// Google OAuth返回的account对象包含：
{
  providerAccountId: "1234567890", // Google的sub，永久不变
  provider: "google",
  type: "oauth"
}

// 我们使用providerAccountId作为稳定的用户标识符
const userId = account?.providerAccountId || user.email || user.id
```

### 存储键格式

```typescript
// 设置存储键
;`user:${userId}:settings`

// 示例
;('user:1234567890:settings')
;('user:user@example.com:settings')
```

## 注意事项

1. **现有用户数据迁移**: 如果已有用户使用旧的ID保存了数据，需要考虑数据迁移
2. **Redis配置**: 生产环境必须配置Redis，否则数据不会持久化
3. **隐私考虑**: 使用email作为备选ID时，确保符合隐私政策

## 相关文件

- `lib/auth.ts` - 认证配置和用户ID生成
- `lib/storage.ts` - 存储抽象层
- `lib/actions/settings.ts` - 设置保存逻辑
- `.env.example` - 环境变量示例
