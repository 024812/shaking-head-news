# API 文档 (API Documentation)

本文档描述"摇头看新闻"Web 应用的 API 接口和 Server Actions。

---

## 📋 目录

- [概述](#概述)
- [认证](#认证)
- [Server Actions](#server-actions)
  - [新闻操作](#新闻操作)
  - [设置操作](#设置操作)
  - [统计操作](#统计操作)
  - [RSS 操作](#rss-操作)
- [数据模型](#数据模型)
- [错误处理](#错误处理)
- [速率限制](#速率限制)
- [示例代码](#示例代码)

---

## 概述

### 技术架构

应用使用 Next.js 15 的 Server Actions 作为主要的 API 接口：

- **Server Actions**: 服务端函数，用于数据变更和获取
- **ISR (Incremental Static Regeneration)**: 用于缓存和优化数据获取
- **NextAuth.js**: 用于用户认证
- **Upstash Redis**: 用于数据存储

### 基础 URL

```
开发环境: http://localhost:3000
生产环境: https://024812.xyz
```

### 数据格式

所有 API 使用 JSON 格式，并通过 Zod 进行数据验证。

---

## 认证

### NextAuth.js

应用使用 NextAuth.js v5 进行用户认证。

#### 登录

```typescript
import { signIn } from 'next-auth/react'

// Google OAuth 登录
await signIn('google', { callbackUrl: '/' })
```

#### 登出

```typescript
import { signOut } from 'next-auth/react'

// 登出
await signOut({ callbackUrl: '/login' })
```

#### 获取会话

```typescript
import { useSession } from 'next-auth/react'

// 在客户端组件中
const { data: session, status } = useSession()

// 在服务端
import { auth } from '@/lib/auth'
const session = await auth()
```

#### 会话数据结构

```typescript
interface Session {
  user: {
    id: string
    name?: string
    email?: string
    image?: string
  }
  expires: string
}
```

---

## Server Actions

### 新闻操作

#### getNews

获取新闻列表，支持 ISR 缓存。

**函数签名**:

```typescript
async function getNews(language: 'zh' | 'en', source?: string): Promise<NewsResponse>
```

**参数**:

- `language`: 语言 ('zh' 或 'en')
- `source`: 可选，新闻源 ID

**返回值**:

```typescript
interface NewsResponse {
  items: NewsItem[]
  total: number
  updatedAt: string
}

interface NewsItem {
  id: string
  title: string
  description?: string
  url: string
  source: string
  publishedAt: string
  category?: string
  imageUrl?: string
}
```

**示例**:

```typescrip

```
