# Implementation Plan: UI Theme Optimization (Soft UI Evolution)

## Overview

本任务列表将 Soft UI Evolution 主题设计转化为具体的实现步骤。采用渐进式更新策略，确保每个步骤都可以独立验证。

## Tasks

- [x] 1. 更新全局配色系统
  - [x] 1.1 更新 globals.css 中的 CSS 变量定义
    - 更新 :root 中的浅色模式配色
    - 更新 .dark 中的深色模式配色
    - 添加新的阴影变量定义
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_
  - [x] 1.2 添加 Noto Sans SC 中文字体支持
    - 在 layout.tsx 中导入 Noto Sans SC
    - 配置字体回退链
    - _Requirements: 7.1, 7.2_

- [x] 2. 更新阴影和动画系统
  - [x] 2.1 在 globals.css 中添加阴影令牌
    - 定义 shadow-sm, shadow-md, shadow-lg
    - 定义 shadow-hover 悬停阴影
    - 添加深色模式阴影变体
    - _Requirements: 2.1, 2.4, 2.5_
  - [x] 2.2 添加 prefers-reduced-motion 支持
    - 添加媒体查询禁用动画
    - _Requirements: 6.4_

- [x] 3. Checkpoint - 验证基础主题系统
  - 确保所有 CSS 变量正确定义
  - 验证浅色/深色模式切换正常
  - 确保字体正确加载

- [x] 4. 更新 News Card 组件
  - [x] 4.1 重构 NewsItem.tsx 组件样式
    - 添加圆角 (rounded-xl)
    - 添加阴影和边框
    - 添加悬停效果 (scale, shadow)
    - 添加 cursor-pointer
    - 添加过渡动画
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 2.2, 2.3_
  - [ ]* 4.2 编写 NewsItem 组件单元测试
    - 验证样式类正确应用
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 5. 更新 Header 组件
  - [x] 5.1 优化 header.tsx 样式
    - 增强毛玻璃效果
    - 更新导航链接悬停样式
    - 确保 sticky 定位和 z-index
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  - [ ]* 5.2 编写 Header 组件单元测试
    - 验证样式类正确应用
    - _Requirements: 4.1, 4.4_

- [x] 6. 更新 Button 组件变体
  - [x] 6.1 更新 button.tsx 组件样式
    - 更新 primary 变体使用健康绿
    - 更新 secondary 变体
    - 确保 focus-visible 样式
    - 统一圆角和过渡
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_
  - [ ]* 6.2 编写 Button 组件单元测试
    - 验证各变体样式正确
    - _Requirements: 5.4, 5.5_

- [x] 7. Checkpoint - 验证组件更新
  - 确保所有组件样式正确应用
  - 验证悬停和交互效果
  - 确保深色模式下组件显示正常

- [x] 8. 优化其他 UI 组件
  - [x] 8.1 更新 Card 组件 (components/ui/card.tsx)
    - 应用新的阴影和圆角样式
    - _Requirements: 2.1, 3.1_
  - [x] 8.2 更新 Footer 组件
    - 统一样式与整体主题
    - _Requirements: 1.1_
  - [x] 8.3 更新 Skeleton 组件样式
    - 确保加载状态与主题一致
    - _Requirements: 1.1_

- [x] 9. 添加属性测试
  - [x]* 9.1 编写对比度属性测试
    - **Property 1: WCAG Contrast Ratio Compliance**
    - **Validates: Requirements 1.6, 4.2, 8.1**
  - [x]* 9.2 编写主题一致性属性测试
    - **Property 2: Theme Consistency**
    - **Validates: Requirements 1.4, 1.5, 8.2, 8.3**

- [x] 10. Final Checkpoint - 完整验证
  - 确保所有测试通过
  - 验证浅色/深色模式完整性
  - 验证响应式布局
  - 验证无障碍性 (键盘导航、对比度)

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- 每个任务完成后应验证不影响现有功能
- 优先完成核心配色和组件更新，测试可后续补充
- 建议在开发环境中实时预览更改效果
