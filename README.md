# 🚀 WAI-News: 歪脖子新闻标签页

> 基于 WAI 项目的全新版本，集成每日新闻功能的颈椎健康新标签页扩展

<p align="center">
  <img width="128" height="128" src="./public/icons/logo128.png" />
</p>

## ✨ 主要变化

### 📰 **每日新闻替代历史事件**
- 使用 [EverydayNews](https://github.com/ravelloh/everydaynews) 作为数据源
- 实时获取每日新闻资讯
- 支持历史日期新闻查询
- 优雅降级到最新可用新闻

### 🔄 **基于 WAI 的架构**
- 保持原有的三种颈椎健康模式
- 现代 Vue 3 + TypeScript 架构
- 跨浏览器兼容 (Chrome + Firefox)
- 优秀的代码组织和工程实践

## 🎯 **功能特性**

### 🤖 **颈椎健康功能**
- **柔和模式**: 小范围内容摆动，适合轻度活动
- **连续模式**: 每4秒自动左右摆动，持续提醒
- **全面模式**: 随机角度摆动，全面活动颈椎（默认）

### 📰 **新闻资讯功能**
- **每日新闻**: 实时获取当日新闻资讯
- **智能降级**: 当日新闻不可用时自动获取最新新闻
- **清洁展示**: 自动移除新闻条目前的序号
- **错误处理**: 优雅的加载状态和错误提示

### 🍎 **其他功能**
- **当季蔬果**: 健康饮食每一天
- **休息日指南**: 快速知晓下一个休息日
- **响应式设计**: 适配各种屏幕尺寸

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
git clone https://github.com/024812/wai-news.git
cd wai-news

# 安装依赖
npm install

# 开发模式
npm run dev

# 构建扩展
npm run build
```

### 浏览器扩展安装
1. 运行 `npm run build` 构建项目
2. 打开浏览器扩展管理页面
3. 启用"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目的 `dist` 文件夹

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
wai-news/
├── src/
│   ├── components/          # Vue 组件
│   │   ├── TodayEvent.vue  # 新闻展示组件
│   │   ├── ContentCard.vue # 内容卡片组件
│   │   └── ...
│   ├── composables/         # Vue 组合式API
│   │   ├── useEverydayNews.ts  # 新闻数据管理
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

### 其他资源
- 当季蔬果数据来自知乎相关问答
- 休息日API由 [timor.tech](https://timor.tech/api/holiday) 提供

---

**让新闻资讯与颈椎健康完美结合！** 📰💪
