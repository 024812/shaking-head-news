# 🚀 摇头看新闻 (Shaking Head News)

> **"Shake your head while watching the news"** - 一边摇头一边看新闻的颈椎健康浏览器扩展

<p align="center">
  <img width="128" height="128" src="ytkxw.png" />
</p>

## 🚀 **在线演示**

[https://024812.xyz](https://024812.xyz)

> 如果不想作为浏览器扩展安装，也可以直接把该网站收藏使用。

##  **项目理念**

看新闻让人摇头叹息？不如真的摇摇头！这款扩展让你在浏览每日新闻的同时，通过巧妙的页面转动设计促进颈椎活动，把"摇头叹息"变成"健康摇头"。

## ✨ **主要特色**

### 📰 **高度可定制的新闻源**
- **内置新闻**: 默认集成 [EverydayNews](https://github.com/ravelloh/everydaynews) 数据源。
- **RSS 订阅**: 支持添加、管理和切换多个自定义 RSS 订阅源。
- **智能缓存**: 内置缓存系统，加速内容加载并减少网络请求，支持自定义缓存策略。

### 🤸 **智能颈椎健康模式**
- **两种核心模式**:
    - **固定模式 (Soft)**: 页面保持近乎固定，仅进行微小、不易察觉的转动，适合需要集中注意力的静态阅读。
    - **连续模式 (Continuous)**: 页面按用户设定的时间间隔（预设10秒至2分钟，或自定义）自动转动，有效提醒和促进颈部活动。
- **动效与无障碍**:
    - **尊重系统偏好**: 自动检测并遵循操作系统的“减弱动态效果”设置。
    - **手动控制**: 用户可随时暂停/继续页面旋转，或完全禁用旋转效果。
    - **清晰的状态提示**: 明确告知用户当前的旋转状态（激活、暂停、禁用）。

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
- **RSS源管理**: 提供完整的UI界面，用于添加、删除、启用/禁用和测试RSS源。
- **活跃源切换**: 用户可以方便地在多个已启用的RSS源之间切换。
- **缓存管理**: 提供UI界面，用于查看缓存统计、设置缓存有效期、清除过期缓存或清空所有缓存。

### 模式与动效配置
- **模式切换**: 用户可在“固定模式”和“连续模式”之间自由切换。
- **间隔自定义**: 在“连续模式”下，用户可选择预设的时间间隔或输入自定义秒数。
- **无障碍控制**: 用户可配置是否遵循系统动效偏好，并可独立控制是否允许页面旋转。

## 🏗️ **项目结构**

```
shaking-head-news/
├── src/
│   ├── components/              # Vue 组件
│   │   ├── EverydayNews.vue     # 新闻展示
│   │   ├── DateTime.vue         # 日期和时间
│   │   ├── SettingsMenu.vue     # 核心设置菜单
│   │   ├── ModeSelector.vue     # 模式选择器
│   │   └── NotificationCenter.vue # 全局通知中心
│   ├── composables/             # Vue 组合式API
│   │   ├── useEverydayNews.ts     # 新闻数据获取与管理
│   │   ├── useMode.ts           # 旋转模式逻辑
│   │   ├── useRssFeeds.ts       # RSS 源管理
│   │   ├── useNewsCache.ts      # 新闻缓存管理
│   │   ├── useMotionPreferences.ts # 动效与无障碍首选项
│   │   └── ...
│   ├── services/               # API 服务
│   │   ├── EverydayNewsService.ts # 新闻数据服务
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
