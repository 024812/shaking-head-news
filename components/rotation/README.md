# 页面旋转动画系统 (Page Rotation Animation System)

## 概述

页面旋转动画系统使用 Framer Motion 和 Zustand 实现，提供平滑的页面旋转效果，帮助用户在阅读新闻时活动颈椎。

## 组件

### TiltWrapper

包装器组件，为其子元素添加旋转动画效果。

**特性：**
- 支持固定模式和连续模式
- 自动检测 `prefers-reduced-motion` 并禁用动画
- 使用 Framer Motion 实现平滑过渡
- 旋转角度范围：
  - 固定模式：-2° 到 2°
  - 连续模式：-10° 到 10°

**使用方法：**

```tsx
import { TiltWrapper } from '@/components/rotation/TiltWrapper'

export default function Page() {
  return (
    <TiltWrapper mode="continuous" interval={10}>
      <div>您的内容</div>
    </TiltWrapper>
  )
}
```

**Props：**
- `children`: React.ReactNode - 要包装的内容
- `mode?`: 'fixed' | 'continuous' - 旋转模式（可选，默认使用 store 中的值）
- `interval?`: number - 旋转间隔（秒）（可选，默认使用 store 中的值）

### RotationControls

旋转控制面板，允许用户控制旋转行为。

**特性：**
- 暂停/继续旋转
- 切换旋转模式（固定/连续）
- 调整旋转间隔（5-300 秒）
- 实时预览当前设置

**使用方法：**

```tsx
import { RotationControls } from '@/components/rotation/RotationControls'

export default function SettingsPage() {
  return (
    <div>
      <RotationControls />
    </div>
  )
}
```

## 状态管理

### useRotationStore

Zustand store，管理旋转状态。

**状态：**
- `angle`: number - 当前旋转角度
- `isPaused`: boolean - 是否暂停
- `mode`: 'fixed' | 'continuous' - 旋转模式
- `interval`: number - 旋转间隔（秒）

**操作：**
- `setAngle(angle: number)`: 设置旋转角度
- `togglePause()`: 切换暂停状态
- `setMode(mode: 'fixed' | 'continuous')`: 设置旋转模式
- `setInterval(interval: number)`: 设置旋转间隔
- `reset()`: 重置为默认状态

**使用方法：**

```tsx
import { useRotationStore } from '@/lib/stores/rotation-store'

function MyComponent() {
  const { angle, isPaused, togglePause } = useRotationStore()
  
  return (
    <div>
      <p>当前角度: {angle}°</p>
      <button onClick={togglePause}>
        {isPaused ? '继续' : '暂停'}
      </button>
    </div>
  )
}
```

## 旋转模式

### 固定模式 (Fixed Mode)

页面保持一个固定的小角度旋转（-2° 到 2°），适合长时间阅读。

### 连续模式 (Continuous Mode)

页面定期改变旋转角度（-10° 到 10°），根据设定的时间间隔自动变化，提供更多的颈椎运动。

## 无障碍支持

系统自动检测用户的 `prefers-reduced-motion` 设置：
- 如果用户启用了减少动画，所有旋转动画将被禁用
- 页面将以正常方式显示，不会有任何旋转效果

## 性能优化

- 使用 Framer Motion 的硬件加速
- 旋转状态持久化到 localStorage
- 使用 `useEffect` 清理定时器，避免内存泄漏
- 仅在必要时重新渲染组件

## 集成示例

在根布局中集成 TiltWrapper：

```tsx
// app/layout.tsx
import { TiltWrapper } from '@/components/rotation/TiltWrapper'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <TiltWrapper>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main>{children}</main>
            <Footer />
          </div>
        </TiltWrapper>
      </body>
    </html>
  )
}
```

## 需求映射

本实现满足以下需求：

- **需求 6.1**: 使用 Framer Motion 在客户端组件中实现旋转动画 ✅
- **需求 6.2**: 使用 motion.div 组件以 0.6 秒的 easeInOut 过渡效果旋转内容 ✅
- **需求 6.3**: 固定模式将旋转角度限制在 -2 度到 2 度之间 ✅
- **需求 6.4**: 连续模式根据用户设定的时间间隔自动改变旋转角度 ✅
- **需求 6.5**: 使用 Zustand 存储暂停状态并停止角度变化 ✅
- **需求 6.6**: 检测 prefers-reduced-motion 时自动禁用所有旋转动画 ✅
