# Vercel 部署检查清单

## 代码推送状态

✅ 代码已推送到 GitHub (commit: 6fd5f70)

## 修复内容

- ✅ 健康提醒立即触发问题
- ✅ 统计数字为0问题
- ✅ 内存存储备选方案

## Vercel 部署步骤

### 1. 检查部署状态

访问 Vercel Dashboard 查看部署进度：

- https://vercel.com/dashboard

### 2. 必需的环境变量

⚠️ **重要**: 在 Vercel 项目设置中配置以下环境变量

#### 认证相关（必需）

```
NEXTAUTH_SECRET=<生成一个随机密钥>
NEXTAUTH_URL=https://your-domain.vercel.app
AUTH_SECRET=<与NEXTAUTH_SECRET相同>
```

生成密钥命令：

```bash
openssl rand -base64 32
```

#### Google OAuth（必需 - 用于登录）

```
AUTH_GOOGLE_ID=<你的Google Client ID>
AUTH_GOOGLE_SECRET=<你的Google Client Secret>
```

配置步骤：

1. 访问 https://console.cloud.google.com/apis/credentials
2. 创建 OAuth 2.0 客户端 ID
3. 添加授权重定向 URI：
   - https://your-domain.vercel.app/api/auth/callback/google

#### Redis 存储（推荐 - 用于数据持久化）

```
UPSTASH_REDIS_REST_URL=<你的Redis URL>
UPSTASH_REDIS_REST_TOKEN=<你的Redis Token>
```

配置步骤：

1. 在 Vercel Dashboard 中点击 "Storage"
2. 选择 "Create Database"
3. 选择 "KV (Redis)" powered by Upstash
4. 环境变量会自动添加

#### 其他配置

```
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEWS_API_BASE_URL=https://news.ravelloh.top
```

### 3. 部署后测试

#### 测试清单

- [ ] 网站可以访问
- [ ] 首页正常加载
- [ ] 新闻列表显示
- [ ] 可以登录（Google OAuth）
- [ ] 统计页面不会立即显示健康提醒
- [ ] 旋转功能正常工作
- [ ] 统计数据可以记录（如果配置了Redis）

#### 测试步骤

1. **访问首页**

   ```
   https://your-domain.vercel.app
   ```

2. **测试登录**

   - 点击右上角登录按钮
   - 使用 Google 账号登录
   - 确认登录成功

3. **测试统计页面**

   - 访问 /stats 页面
   - 确认不会立即显示健康提醒
   - 统计数字显示为 0（正常）

4. **测试旋转功能**

   - 返回首页
   - 打开右下角旋转控制
   - 启用连续模式
   - 等待几个旋转周期

5. **验证统计更新**
   - 返回统计页面
   - 刷新页面
   - 确认统计数字更新

### 4. 常见问题

#### 问题1: 部署失败

**可能原因**:

- 环境变量未配置
- 构建错误

**解决方法**:

- 检查 Vercel 部署日志
- 确认所有必需的环境变量已配置
- 本地运行 `npm run build` 测试构建

#### 问题2: 登录失败

**可能原因**:

- Google OAuth 未配置
- 回调 URL 不正确

**解决方法**:

- 检查 AUTH_GOOGLE_ID 和 AUTH_GOOGLE_SECRET
- 确认 Google Console 中的回调 URL 正确
- 检查 NEXTAUTH_URL 是否正确

#### 问题3: 统计数据不保存

**可能原因**:

- Redis 未配置
- 使用内存存储（数据不持久化）

**解决方法**:

- 在 Vercel 中添加 Upstash Redis
- 确认环境变量 UPSTASH_REDIS_REST_URL 和 UPSTASH_REDIS_REST_TOKEN 已设置

#### 问题4: 健康提醒还是立即触发

**可能原因**:

- 浏览器缓存
- 旧版本代码

**解决方法**:

- 清除浏览器缓存
- 确认 Vercel 部署的是最新代码
- 检查部署的 commit hash

### 5. 性能检查

部署后运行 Lighthouse 测试：

1. 打开 Chrome DevTools
2. 切换到 Lighthouse 标签
3. 运行测试
4. 检查性能指标

目标指标：

- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

### 6. 监控设置

#### Vercel Analytics（推荐）

1. 在 Vercel Dashboard 中启用 Analytics
2. 查看实时访问数据

#### Vercel Speed Insights（推荐）

1. 在 Vercel Dashboard 中启用 Speed Insights
2. 监控真实用户性能数据

#### 错误监控（可选）

考虑集成 Sentry 进行错误追踪：

```
SENTRY_DSN=<你的Sentry DSN>
```

### 7. 域名配置（可选）

如果要使用自定义域名：

1. 在 Vercel Dashboard 中添加域名
2. 配置 DNS 记录
3. 更新环境变量中的 URL
4. 更新 Google OAuth 回调 URL

---

## 快速检查命令

### 检查部署状态

```bash
# 使用 Vercel CLI
vercel ls

# 查看最新部署
vercel inspect
```

### 查看部署日志

```bash
vercel logs
```

### 重新部署

```bash
vercel --prod
```

---

## 联系信息

如果遇到问题：

1. 查看 Vercel 部署日志
2. 检查浏览器控制台错误
3. 参考项目文档：
   - docs/DEPLOYMENT.md
   - docs/STATS_PAGE_FIX.md
   - docs/STATS_FIX_SUMMARY.md

---

**部署时间**: 2025-11-13  
**Commit**: 6fd5f70  
**修复内容**: 统计页面健康提醒和数据记录问题
