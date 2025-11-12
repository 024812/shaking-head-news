# 项目迁移清理指南

## 当前状态

项目正在从 Vue 3 + Vite 迁移到 Next.js 15 + React 19。当前目录中同时存在旧项目和新项目的文件。

## 目录结构

### 新项目文件（Next.js）
- `app/` - Next.js App Router
- `components/` - React 组件
- `lib/` - 工具函数和配置
- `types/` - TypeScript 类型定义
- `proxy.ts` - Next.js 代理文件（替代 middleware）
- `next.config.js` - Next.js 配置

### 旧项目文件（Vue）
- `src/` - Vue 源代码
- `vite.config.ts` - Vite 配置
- `index.html` - Vite 入口文件
- `manifest.config.ts` - 浏览器扩展配置
- ~~`middleware.ts`~~ - 已删除，使用 `proxy.ts` 替代

## 清理选项

### 选项 1：完全删除旧项目（推荐）

如果你确定不再需要旧项目代码：

```bash
# 删除旧项目目录和文件
Remove-Item -Recurse -Force src
Remove-Item vite.config.ts
Remove-Item index.html
Remove-Item manifest.config.ts
Remove-Item .postcssrc
Remove-Item .stylelintignore
Remove-Item .stylelintrc

# 清理缓存
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force dist
```

### 选项 2：备份旧项目

如果你想保留旧项目作为参考：

```bash
# 创建备份目录
New-Item -ItemType Directory -Path old-vue-project

# 移动旧项目文件
Move-Item src old-vue-project/
Move-Item vite.config.ts old-vue-project/
Move-Item index.html old-vue-project/
Move-Item manifest.config.ts old-vue-project/
Move-Item dist old-vue-project/ -ErrorAction SilentlyContinue

# 清理缓存
Remove-Item -Recurse -Force .next
```

### 选项 3：暂时保留（当前状态）

如果你还在迁移过程中，需要参考旧代码：

- 保持当前状态
- 确保 Next.js 开发服务器不会加载旧项目文件
- 注意端口冲突

## 已完成的清理

- [x] 删除 `middleware.ts`（已被 `proxy.ts` 替代）
- [x] 清理 `.next` 缓存

## 推荐的清理步骤

1. **备份重要数据**
   ```bash
   # 如果有自定义配置或数据，先备份
   Copy-Item src/data old-vue-project/data -Recurse
   ```

2. **删除旧项目文件**
   ```bash
   Remove-Item -Recurse -Force src
   Remove-Item vite.config.ts
   Remove-Item index.html
   Remove-Item manifest.config.ts
   ```

3. **清理缓存和构建文件**
   ```bash
   Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
   Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
   ```

4. **重新启动开发服务器**
   ```bash
   npm run dev
   ```

## 注意事项

### 保留的旧项目配置文件

以下文件可能在新旧项目中都有用，暂时保留：

- `.editorconfig` - 编辑器配置
- `.prettierrc` - 代码格式化配置
- `.gitignore` - Git 忽略规则
- `tsconfig.json` - TypeScript 配置（已更新为 Next.js 版本）
- `tailwind.config.ts` - Tailwind 配置（已更新）
- `postcss.config.js` - PostCSS 配置（Next.js 需要）

### 需要迁移的数据

如果旧项目中有以下数据，需要迁移到新项目：

1. **新闻源配置** (`src/data/` 或配置文件)
   - 迁移到 `config/news-sources.ts`

2. **用户设置默认值**
   - 已在 `types/settings.ts` 中定义

3. **RSS 源列表**
   - 需要迁移到新的数据结构

## 故障排除

### 问题：开发服务器报错 "unrecognized HMR message"

**原因：** Next.js 尝试加载旧项目的代码

**解决方案：**
1. 清理 `.next` 缓存
2. 删除或移动 `src/` 目录
3. 重启开发服务器

### 问题：端口 3000 被占用

**解决方案：**
```bash
# 查找占用端口的进程
netstat -ano | findstr :3000

# 结束进程（替换 PID）
taskkill /PID <PID> /F

# 或使用不同端口
npm run dev -- -p 3001
```

## 下一步

清理完成后：

1. 重启开发服务器：`npm run dev`
2. 访问 `http://localhost:3000` 验证新项目
3. 继续实现 Task 5（新闻数据服务）
