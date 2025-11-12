# 浏览器缓存清理指南

## 问题

如果你在浏览器中看到旧项目的错误（如 `TRPCProvider`, `DashboardPage` 等），这是因为浏览器缓存了旧项目的代码和 Service Worker。

## 解决方案

### 方法 1：清除浏览器缓存（推荐）

#### Chrome/Edge
1. 打开开发者工具（F12）
2. 右键点击刷新按钮
3. 选择"清空缓存并硬性重新加载"

或者：
1. 按 `Ctrl + Shift + Delete`
2. 选择"缓存的图片和文件"
3. 时间范围选择"全部时间"
4. 点击"清除数据"

#### Firefox
1. 按 `Ctrl + Shift + Delete`
2. 选择"缓存"
3. 时间范围选择"全部"
4. 点击"立即清除"

### 方法 2：注销 Service Worker

1. 打开开发者工具（F12）
2. 进入 Application/应用程序 标签
3. 在左侧找到 "Service Workers"
4. 点击 "Unregister" 注销所有 Service Worker
5. 刷新页面

### 方法 3：使用无痕/隐私模式

1. 打开无痕窗口（Ctrl + Shift + N）
2. 访问 `http://localhost:3000`
3. 这样可以避免缓存问题

### 方法 4：使用不同的端口

如果上述方法都不行，可以使用不同的端口：

```bash
npm run dev -- -p 3001
```

然后访问 `http://localhost:3001`

## 验证清理成功

清理成功后，你应该看到：

1. **首页**显示"欢迎来到摇头看新闻"
2. **没有** `TRPCProvider` 或 `DashboardPage` 相关的错误
3. 页面顶部有导航栏，包含"首页"、"设置"、"统计"链接
4. 右上角有主题切换按钮和登录按钮

## 开发服务器状态

开发服务器应该显示：

```
✓ Ready in 2.2s
- Local:        http://localhost:3000
- Network:      http://10.x.x.x:3000
```

没有 `unrecognized HMR message` 或其他错误。

## 如果问题仍然存在

1. 停止开发服务器（Ctrl + C）
2. 清理所有缓存：
   ```bash
   Remove-Item -Recurse -Force .next, node_modules/.cache
   ```
3. 重新构建：
   ```bash
   npm run build
   ```
4. 重新启动：
   ```bash
   npm run dev
   ```
5. 在浏览器中清除所有缓存
6. 使用无痕模式访问

## 注意事项

- Service Worker 可能会持续缓存旧代码
- 浏览器的 HTTP 缓存也可能保留旧文件
- 建议在开发时使用"禁用缓存"选项（开发者工具 → Network 标签）
