# 设置保存功能调试指南

## 问题：设置保存不工作

### 可能的原因

#### 1. 未登录

**症状**：点击保存按钮没有反应或显示错误
**检查**：

- 右上角是否显示用户头像？
- 如果没有，需要先登录

**解决**：

- 点击右上角登录按钮
- 使用 Google 账号登录

---

#### 2. Redis 连接问题

**症状**：显示"保存失败"错误
**检查**：

1. 在 Vercel Dashboard 检查环境变量：
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
2. 查看 Vercel Functions 日志

**解决**：

- 确认环境变量正确配置
- 重新部署应用

---

#### 3. 速率限制

**症状**：显示 "Too many requests. Please try again later."
**当前限制**：100 次请求 / 60 秒

**解决**：

- 等待 1 分钟后重试
- 避免频繁点击保存按钮
- 使用滑块时，松开后再保存

---

#### 4. 浏览器控制台错误

**检查步骤**：

1. 按 F12 打开开发者工具
2. 切换到 Console 标签
3. 点击保存按钮
4. 查看是否有红色错误信息

**常见错误**：

- `401 Unauthorized` → 需要登录
- `429 Too Many Requests` → 速率限制
- `500 Internal Server Error` → 服务器错误，检查 Vercel 日志

---

### 调试步骤

#### 步骤 1：检查登录状态

```
1. 访问设置页面
2. 查看右上角是否有用户头像
3. 如果没有，点击登录
```

#### 步骤 2：测试保存功能

```
1. 修改一个设置（如主题）
2. 点击"保存"按钮
3. 观察是否显示成功提示
```

#### 步骤 3：检查浏览器控制台

```
1. 按 F12 打开开发者工具
2. 切换到 Console 标签
3. 重新点击保存
4. 查看错误信息
```

#### 步骤 4：检查 Network 请求

```
1. 在开发者工具中切换到 Network 标签
2. 点击保存按钮
3. 查找 updateSettings 请求
4. 检查状态码和响应
```

---

### Vercel 日志检查

#### 查看函数日志

1. 访问 Vercel Dashboard
2. 选择项目
3. 点击 "Functions" 标签
4. 查看最近的日志

#### 常见日志信息

```
✅ 成功：
[getUserSettings] Fetching settings for user: xxx
[updateSettings] Settings updated successfully

❌ 失败：
[Storage] Redis not configured
[updateSettings] Rate limit exceeded
[updateSettings] Authentication failed
```

---

### 测试 Redis 连接

#### 方法 1：通过设置页面

1. 登录应用
2. 修改任意设置
3. 点击保存
4. 刷新页面
5. 检查设置是否保持

#### 方法 2：查看 Vercel 日志

1. 保存设置后
2. 立即查看 Vercel Functions 日志
3. 搜索 "storage" 或 "redis"
4. 确认没有连接错误

---

### 当前代码状态

#### 已修复的问题

- ✅ 速率限制从 30/分钟 提升到 100/分钟
- ✅ 移除了不必要的 Redis 检查
- ✅ 添加了内存存储备选方案

#### 当前配置

```typescript
// 速率限制
RateLimitTiers.RELAXED: 100 requests / 60 seconds

// 存储
- 优先使用 Redis（如果配置）
- 备选使用内存存储（开发环境）
```

---

### 快速测试脚本

#### 测试设置保存

1. 登录应用
2. 访问 /settings
3. 修改主题：亮色 → 暗色
4. 点击保存
5. 刷新页面
6. 确认主题保持为暗色

#### 测试设置同步

1. 在浏览器 A 保存设置
2. 在浏览器 B 登录同一账号
3. 访问 /settings
4. 确认设置已同步

---

### 环境变量检查清单

在 Vercel Dashboard → Settings → Environment Variables 确认：

#### 必需变量

- [ ] `NEXTAUTH_SECRET`
- [ ] `NEXTAUTH_URL`
- [ ] `AUTH_SECRET`
- [ ] `AUTH_GOOGLE_ID`
- [ ] `AUTH_GOOGLE_SECRET`

#### Redis 变量（已配置）

- [ ] `UPSTASH_REDIS_REST_URL`
- [ ] `UPSTASH_REDIS_REST_TOKEN`

#### 其他变量

- [ ] `NEXT_PUBLIC_APP_URL`
- [ ] `NEWS_API_BASE_URL`

---

### 如果问题仍然存在

#### 收集信息

1. 浏览器控制台的完整错误信息
2. Vercel Functions 日志
3. 具体的操作步骤
4. 是否已登录

#### 临时解决方案

- 使用浏览器的本地存储（设置会保存在浏览器中）
- 每次访问时重新设置

#### 联系支持

提供以下信息：

- 错误截图
- 浏览器控制台日志
- Vercel 函数日志
- 环境变量配置（隐藏敏感信息）

---

## 最新部署信息

- **最新 Commit**: f63f6c8
- **修复内容**: 移除 Redis 检查，放宽速率限制
- **部署状态**: 检查 Vercel Dashboard

---

**提示**：如果你已经配置了 Redis，设置应该可以正常保存并在刷新后保持。如果还有问题，请按照上述步骤排查。
