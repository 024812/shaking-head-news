# Vercel 环境变量配置指南

## 🚨 当前问题

部署成功但运行时出错：
```
An error occurred in the Server Components render
```

**原因：** 缺少必需的环境变量，特别是 Upstash Redis 配置。

---

## ✅ 必需的环境变量

在 Vercel Dashboard 中配置以下环境变量：

### 1. 进入项目设置
1. 打开 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目 `shaking-head-news`
3. 进入 **Settings** > **Environment Variables**

### 2. 添加以下变量

#### NextAuth 配置
```bash
NEXTAUTH_SECRET=<生成一个随机密钥>
NEXTAUTH_URL=https://your-project.vercel.app
```

**生成 NEXTAUTH_SECRET：**
```bash
openssl rand -base64 32
```

#### Google OAuth（可选，但推荐）
```bash
GOOGLE_CLIENT_ID=<你的 Google Client ID>
GOOGLE_CLIENT_SECRET=<你的 Google Client Secret>
```

**获取方式：**
1. 访问 [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. 创建 OAuth 2.0 客户端 ID
3. 添加授权重定向 URI：`https://your-project.vercel.app/api/auth/callback/google`

#### Upstash Redis（必需！）⚠️
```bash
UPSTASH_REDIS_REST_URL=<你的 Upstash Redis REST URL>
UPSTASH_REDIS_REST_TOKEN=<你的 Upstash Redis REST Token>
```

**获取方式（推荐）：**

**方法 1：通过 Vercel Marketplace（最简单）**
1. 在 Vercel 项目页面，点击 **Storage** 标签
2. 点击 "Create Database"
3. 选择 **KV (Redis)** powered by Upstash
4. 选择区域（建议选择离你最近的）
5. 点击 "Create"
6. 环境变量会自动添加 ✅

**方法 2：直接从 Upstash**
1. 访问 [Upstash Console](https://console.upstash.com)
2. 注册/登录账号
3. 创建新的 Redis 数据库
4. 选择区域
5. 复制 **REST URL** 和 **REST Token**
6. 在 Vercel 中手动添加这两个环境变量

#### 应用配置
```bash
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
NEWS_API_BASE_URL=https://news.ravelloh.top
```

---

## 📝 配置步骤

### 步骤 1：添加环境变量
1. 在 Vercel Dashboard 的 Environment Variables 页面
2. 点击 "Add New"
3. 输入变量名和值
4. 选择环境：**Production, Preview, Development**（全选）
5. 点击 "Save"

### 步骤 2：重新部署
添加环境变量后，需要触发重新部署：

**方法 1：通过 Dashboard**
1. 进入 **Deployments** 标签
2. 点击最新部署右侧的三个点
3. 选择 "Redeploy"
4. 确认重新部署

**方法 2：通过 Git 推送**
```bash
git commit --allow-empty -m "chore: trigger redeploy after env vars"
git push
```

---

## 🔍 验证配置

重新部署后，访问你的网站：

1. **首页** - 应该正常显示
2. **登录** - 点击 "Sign in with Google" 应该能正常跳转
3. **设置** - 登录后应该能访问设置页面
4. **统计** - 登录后应该能查看统计数据

---

## ❌ 常见错误

### 错误 1：Server Components render error
**原因：** 缺少 Upstash Redis 环境变量
**解决：** 按照上面的步骤配置 `UPSTASH_REDIS_REST_URL` 和 `UPSTASH_REDIS_REST_TOKEN`

### 错误 2：OAuth 重定向失败
**原因：** `NEXTAUTH_URL` 不正确或 Google OAuth 重定向 URI 未配置
**解决：**
1. 确认 `NEXTAUTH_URL` 与实际部署 URL 一致
2. 在 Google Cloud Console 添加正确的重定向 URI

### 错误 3：设置无法保存
**原因：** Upstash Redis 连接失败
**解决：**
1. 检查 Upstash Redis 凭据是否正确
2. 确认使用的是 **REST URL**（不是 Redis URL）
3. 在 Upstash Console 查看连接日志

---

## 📊 最小可运行配置

如果你只想快速测试，至少需要配置：

```bash
# 必需
NEXTAUTH_SECRET=<随机生成的密钥>
NEXTAUTH_URL=https://your-project.vercel.app
UPSTASH_REDIS_REST_URL=<Upstash REST URL>
UPSTASH_REDIS_REST_TOKEN=<Upstash REST Token>

# 推荐
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
NEWS_API_BASE_URL=https://news.ravelloh.top
```

---

## 🎯 下一步

配置完环境变量并重新部署后：

1. ✅ 网站应该可以正常访问
2. ✅ 所有页面都能正常渲染
3. ✅ 用户可以登录和保存设置
4. ✅ 统计功能正常工作

如果还有问题，查看 Vercel 的 **Functions** 日志获取详细错误信息。

---

**最后更新：** 2025-01-12
