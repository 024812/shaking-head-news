# 🦒 Shaking Head News (摇头看新闻)

> **"Shake your head while watching the news"**
>
> 一边摇头一边看新闻的颈椎健康 Web 应用，把"摇头叹息"变成"健康摇头"。

<p align="center">
  <img width="128" height="128" src="public/icons/ytkxw.png" alt="Shaking Head News Logo" />
</p>

[![License](https://img.shields.io/badge/license-MPL--2.0-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16.1-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue)](https://react.dev/)

[**🌐 在线演示 (Demo)**](https://024812.xyz)

---

## 🚀 最新特性 (What's New)

- ✅ **React Compiler**: 启用 Next.js 16 自动优化，性能起飞 ⚡
- ✅ **全网热榜**: 新增历史上的今天、夸克热点、小红书等 10+ 热门数据源 🔥
- ✅ **层级体验**: 访客简报、会员热榜、Pro 专属源，差异化满足需求 💎
- ✅ **智能布局**: 宽屏响应式设计，3列+源选择，侧边栏广告自动优化 📐
- ✅ **健康模式**: 8-25° 智能旋转 + 5-60秒 自定义间隔 🧘

## ✨ 核心功能

- **📰 聚合新闻**:
  - **访客**: 每日简报 + AI 科技资讯，快速了解天下事。
  - **会员**: 解锁全网热榜（抖音、微博、知乎、历史上的今天等 10+ 源）。
  - **Pro**: 支持自定义 RSS/OPML 订阅，打造专属信息流。
- **🤸 颈椎健康**:
  - **固定模式**: 微小转动，适合专注阅读。
  - **连续模式**: 定时大幅转动，强制活动颈椎。
- **🔐 云端同步**: Google/Microsoft 账号登录，设置跨设备自动同步。
- **🎨 现代体验**: 深色模式、i18n 多语言、PWA 级流畅度。

## 🛠️ 技术栈 (Tech Stack)

- **Framework**: Next.js 16 (App Router, Turbopack)
- **UI**: React 19, Tailwind CSS 4, Shadcn/ui, Framer Motion
- **Data**: Zustand (State), Upstash Redis (Storage), NextAuth.js v5 (Auth)
- **Quality**: TypeScript 5.7, ESLint 9, React Compiler

## 🚦 快速开始 (Quick Start)

**1. 克隆与安装**

```bash
git clone https://github.com/ohengcom/shaking-head-news.git
npm install
```

**2. 环境配置**

复制 `.env.example` 到 `.env.local` 并填入必要信息（NextAuth, Google ID 等）。

**3. 启动开发**

```bash
npm run dev
# 访问 http://localhost:3000
```

## 📚 文档

- [部署指南](docs/DEPLOYMENT.md)
- [性能优化](docs/PERFORMANCE_GUIDE.md)
- [更新日志](CHANGELOG.md)

## ❤️ 致谢 (Credits)

- **News API**: Special thanks to [vikiboss/60s](https://github.com/vikiboss/60s) for providing the excellent 60s News API service.

---

<p align="center">Made with ❤️ by ohengcom</p>
