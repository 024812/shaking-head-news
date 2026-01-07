# Implementation Plan: Project Upgrade

## Overview

本任务列表将项目升级设计转化为具体的实施步骤。采用渐进式更新策略，确保每个步骤都可以独立验证。

## Tasks

- [x] 1. 升级 Node.js 版本配置
  - [x] 1.1 更新 package.json 中的 engines 字段
    - 将 `"node": "20.x"` 更新为 `"node": "24.x"`
    - _Requirements: 9.1, 9.2_
  - [x] 1.2 验证 husky prepare 脚本
    - 确保 `"prepare": "husky || true"` 正确处理非 git 环境
    - _Requirements: 9.4_

- [x] 2. 升级生产依赖
  - [x] 2.1 升级核心框架依赖
    - 升级 next 到 16.1.1
    - 升级 react 和 react-dom 到 19.2.3
    - 升级 next-intl 到 4.7.0
    - _Requirements: 1.1, 1.3_
  - [x] 2.2 升级 UI 和动画依赖
    - 升级 framer-motion 到 12.24.7
    - 升级 lucide-react 到 0.562.0
    - 升级 recharts 到 3.6.0
    - _Requirements: 1.1, 1.3_
  - [x] 2.3 升级工具和数据依赖
    - 升级 zod 到 4.3.5
    - 升级 @upstash/redis 到 1.36.0
    - 升级 fast-xml-parser 到 5.3.3
    - _Requirements: 1.1, 1.3_
  - [x] 2.4 升级样式依赖
    - 升级 tailwindcss 到 4.1.18
    - 升级 @tailwindcss/postcss 到 4.1.18
    - _Requirements: 1.1, 1.3_

- [x] 3. 升级开发依赖
  - [x] 3.1 升级 TypeScript 和类型定义
    - 升级 @types/node 到 24.10.4
    - 升级 @typescript-eslint/eslint-plugin 到 8.52.0
    - 升级 @typescript-eslint/parser 到 8.52.0
    - _Requirements: 1.2, 1.3_
  - [x] 3.2 升级 ESLint 和 Next.js 工具
    - 升级 eslint 到 9.39.2
    - 升级 eslint-config-next 到 16.1.1
    - 升级 @next/bundle-analyzer 到 16.1.1
    - _Requirements: 1.2, 1.3_
  - [x] 3.3 升级测试工具
    - 升级 vitest 到 4.0.16
    - 升级 @vitejs/plugin-react 到 5.1.2
    - 升级 @testing-library/react 到 16.3.1
    - 升级 jsdom 到 27.4.0
    - _Requirements: 1.2, 1.3_
  - [x] 3.4 升级其他开发工具
    - 升级 @commitlint/cli 到 20.3.0
    - 升级 @commitlint/config-conventional 到 20.3.0
    - 升级 autoprefixer 到 10.4.23
    - _Requirements: 1.2, 1.3_

- [x] 4. Checkpoint - 验证依赖升级
  - 运行 npm install 确保无错误
  - 运行 npm run build 确保构建成功
  - 运行 npm run type-check 确保类型检查通过

- [x] 5. 清理无用文件和目录
  - [x] 5.1 删除 .shared 目录
    - 删除整个 .shared 目录及其内容
    - _Requirements: 3.4_
  - [x] 5.2 清理配置文件中的无效引用
    - 更新 tsconfig.json exclude 数组，移除不存在的目录
    - 更新 eslint.config.js ignores，移除不存在的目录
    - _Requirements: 3.3, 4.6_

- [x] 6. 优化配置文件
  - [x] 6.1 优化 next.config.js
    - 启用 turbopackFileSystemCacheForDev 实验性功能
    - 确保所有 Next.js 16 推荐配置已启用
    - _Requirements: 4.1, 7.1_
  - [x] 6.2 验证 tailwind.config.ts
    - 确保配置符合 Tailwind CSS 4.x 最佳实践
    - _Requirements: 4.2_
  - [x] 6.3 验证 vitest.config.ts
    - 确保配置使用最新测试模式
    - _Requirements: 4.4_

- [x] 7. 添加 favicon.ico
  - [x] 7.1 生成并添加 favicon.ico 文件
    - 从现有 favicon.png 或 logo 资源生成 favicon.ico
    - 将文件放置在 public 目录
    - _Requirements: 10.1, 10.4_
  - [x] 7.2 更新 metadata 配置
    - 确保 favicon 在 layout.tsx 或 metadata 中正确配置
    - _Requirements: 10.2_

- [x] 8. Checkpoint - 验证配置更新
  - 运行 npm run build 确保构建成功
  - 运行 npm run lint 确保无 lint 错误
  - 验证 favicon 在浏览器中正确显示

- [x] 9. 更新文档
  - [x] 9.1 更新 README.md
    - 更新技术栈版本信息（Node.js 24.x, Next.js 16.1, React 19.2）
    - 更新环境要求部分
    - 移除对已删除文件/目录的引用
    - _Requirements: 5.1, 5.4_
  - [x] 9.2 更新项目结构文档
    - 移除 .shared 目录的引用
    - 确保文档结构与实际文件结构一致
    - _Requirements: 5.5, 5.6_
  - [x] 9.3 清理 docs 目录
    - 检查并更新 docs/ 下的文档
    - 移除过时的文档引用
    - _Requirements: 5.2, 5.3_

- [x] 10. 验证测试套件
  - [x] 10.1 运行单元测试
    - 执行 npm run test 确保所有测试通过
    - _Requirements: 6.3_
  - [ ]\* 10.2 运行测试覆盖率检查
    - 执行 npm run test:coverage 验证覆盖率
    - _Requirements: 6.4_

- [x] 11. 安全性验证
  - [x] 11.1 运行安全审计
    - 执行 npm audit 检查安全漏洞
    - 修复任何高危或严重漏洞
    - _Requirements: 8.1, 8.4_

- [x] 12. Final Checkpoint - 完整验证
  - 确保所有测试通过
  - 确保构建成功无警告
  - 确保 lint 检查通过
  - 验证文档准确性

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- 每个任务完成后应验证不影响现有功能
- 建议在开发环境中实时预览更改效果
- 如果升级导致问题，可以回滚到之前的版本
