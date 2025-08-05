# 🚀 摇头看新闻 (Shaking Head News)

> **"Shake your head while watching the news"** - 一边摇头一边看新闻的颈椎健康浏览器扩展

<p align="center">
  <img width="128" height="128" src="./public/icons/logo128.png" />
</p>

## 💡 **项目理念**

看新闻让人摇头叹息？不如真的摇摇头！这款扩展让你在浏览每日新闻的同时，通过巧妙的页面转动设计促进颈椎活动，把"摇头叹息"变成"健康摇头"。

## ✨ **主要特色**

### 📰 **每日新闻 + 颈椎健康**
- 使用 [EverydayNews](https://github.com/ravelloh/everydaynews) 作为数据源
- 实时获取每日新闻资讯
- 支持历史日期新闻查询
- 优雅降级到最新可用新闻

### 🤖 **三种摇头模式**
- **柔和模式**: 轻微摇头，适合敏感颈椎
- **连续模式**: 每4秒自动摇头，持续提醒
- **全面模式**: 随机角度摇头，全面活动颈椎（默认）

### 🎯 **设计哲学**
将日常的"摇头叹息"转化为有益的颈椎运动，让看新闻变成一种健康的习惯。

### 📰 **新闻资讯功能**
- **每日新闻**: 实时获取当日新闻资讯
- **智能降级**: 当日新闻不可用时自动获取最新新闻
- **清洁展示**: 自动移除新闻条目前的序号
- **错误处理**: 优雅的加载状态和错误提示

### 🎨 **用户体验**
- **简洁布局**: 专注于新闻和时间显示
- **响应式设计**: 适配各种屏幕尺寸
- **可滚动内容**: 支持大量新闻内容展示
- **休息日提醒**: 快速知晓下一个休息日

## 🛠️ **技术栈**

- **Vue 3** - 现代前端框架
- **TypeScript** - 类型安全
- **Vite** - 快速构建工具
- **SCSS** - 样式预处理
- **ESLint + Prettier** - 代码质量保证

## 📦 **安装和使用**

### 开发环境
```bash
# 克隆项目
git clone https://github.com/024812/shaking-head-news.git
cd shaking-head-news

# 安装依赖
npm install

# 开发模式
npm run dev

# 构建扩展
npm run build
```

### 浏览器扩展安装

#### Chrome 安装
1. 运行 `npm run build` 构建项目
2. 打开 `chrome://extensions/`
3. 启用"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目的 `dist` 文件夹

#### Firefox 安装
1. 运行 `npm run build` 构建项目
2. 打开 `about:debugging`
3. 点击"此 Firefox"
4. 点击"加载临时附加组件"
5. 选择 `dist` 文件夹中的 `manifest.json`

## 🔧 **配置**

### 数据源配置
- **新闻数据**: 自动从 `https://ravelloh.github.io/EverydayNews/` 获取
- **缓存策略**: 基于浏览器扩展存储API
- **更新频率**: 每次打开新标签页时检查更新

### 模式配置
- 用户可通过设置菜单切换不同的颈椎健康模式
- 设置会自动保存到浏览器存储中

## 🏗️ **项目结构**

```
shaking-head-news/
├── src/
│   ├── components/          # Vue 组件
│   │   ├── TodayEvent.vue  # 新闻展示组件
│   │   ├── DateTime.vue    # 时间日期组件
│   │   ├── ContentCard.vue # 内容卡片组件
│   │   └── SettingsMenu.vue # 设置菜单组件
│   ├── composables/         # Vue 组合式API
│   │   ├── useEverydayNews.ts  # 新闻数据管理
│   │   ├── useMode.ts       # 摇头模式管理
│   │   └── ...
│   ├── services/           # 服务层
│   │   ├── EverydayNewsService.ts  # 新闻API服务
│   │   └── ...
│   ├── types.ts           # TypeScript 类型定义
│   └── ...
├── manifest.config.ts     # 扩展清单配置
└── package.json          # 项目配置
```

## 🔒 **隐私和安全**

- **最小权限**: 仅使用 `storage` 权限存储用户设置
- **数据安全**: 所有新闻数据来自公开API，不收集个人信息
- **本地存储**: 用户设置仅存储在本地浏览器中

## 🤝 **贡献指南**

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 **开源协议**

本项目基于 [MPL-2.0](LICENSE) 协议开源。

## 🙏 **致谢**

### 基础项目
- 本项目基于 [WAI](https://github.com/dukeluo/wai) 项目开发
- 感谢原作者 [@dukeluo](https://github.com/dukeluo) 的优秀工作

### 数据源
- 新闻数据来源：[EverydayNews](https://github.com/ravelloh/everydaynews)
- 感谢 [@ravelloh](https://github.com/ravelloh) 提供的每日新闻API
- 休息日API由 [timor.tech](https://timor.tech/api/holiday) 提供

---

**把摇头叹息变成健康摇头，让看新闻成为一种颈椎运动！** 📰🤸‍♂️
