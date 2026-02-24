# lottery-app 项目上下文

## 项目概述

**数字滚轮抽奖系统** - 一个基于 Vue 3 + TypeScript 的网页抽奖应用。

### 核心功能
- 🎰 单列滚轮动画抽奖
- 👥 参与者管理（添加、删除、导入/导出）
- 📋 中奖历史记录
- ⚙️ 可配置参数（动画时长、旋转圈数、是否允许重复中奖）
- 💾 本地存储持久化

### 技术栈
| 类别 | 技术 |
|------|------|
| 框架 | Vue 3.4 + Composition API |
| 语言 | TypeScript 5.2 |
| 构建 | Vite 5 |
| 测试 | Vitest + jsdom + @vue/test-utils |
| 类型检查 | vue-tsc |

---

## 项目结构

```
lottery-app/
├── src/
│   ├── main.ts              # 应用入口
│   ├── App.vue              # 主组件（布局与状态管理）
│   ├── env.d.ts             # 环境变量类型声明
│   ├── components/
│   │   ├── Wheel.vue        # 滚轮动画组件
│   │   ├── ParticipantList.vue  # 参与者列表管理
│   │   ├── Settings.vue     # 设置面板
│   │   └── History.vue      # 历史记录展示
│   ├── composables/
│   │   ├── useLottery.ts    # 抽奖核心逻辑
│   │   └── useStorage.ts    # localStorage 封装
│   └── types/               # TypeScript 类型定义
├── tests/
│   ├── index.test.ts
│   ├── types.test.ts
│   └── useLottery.test.ts   # 核心逻辑单元测试
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

---

## 构建与运行

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 生产构建
npm run build

# 预览构建结果
npm run preview

# 运行测试
npm run test           # 监听模式
npm run test:run       # 单次运行
npm run test:ui        # UI 模式
```

---

## 开发规范

### Bug 修复流程

**第 1 步：理解 Bug**
- 请用户描述 Bug 现象
- 确认复现步骤
- 初步定位受影响的组件/文件

**第 2 步：更新 TASKS.md（添加任务）**
- **立即**将 Bug 任务添加到 `TASKS.md` 任务列表
- 标记为待完成 `- [ ]`
- 分配任务编号

**第 3 步：分析代码**
- 阅读相关源文件
- 定位问题代码位置
- 分析根本原因

**第 4 步：实施修复**
- 修改代码
- 遵循 Composition API 规范
- 确保无未使用变量/导入

**第 5 步：验证修复**
```bash
npm run build      # 类型检查 + 构建
npm run test:run   # 运行测试
```

**第 6 步：更新 TASKS.md（记录修复）**
- 将任务标记为完成 `- [x]`
- 在修复记录章节添加详细内容：
  - 日期
  - 任务编号
  - Bug 位置、问题描述、修复方案
  - 测试结果

**第 7 步：提交确认**
- ✅ 构建通过
- ✅ 测试通过
- ✅ TASKS.md 已完整更新

---

### 代码风格
- 使用 `<script setup lang="ts">` 语法
- 组合式 API (Composition API) 优先
- 严格 TypeScript 模式 (`strict: true`)
- 禁止未使用的变量和参数 (`noUnusedLocals`, `noUnusedParameters`)

### 测试实践
- 使用 Vitest 作为测试框架
- 测试文件位于 `tests/` 目录
- 使用 `jsdom` 模拟浏览器环境
- 核心逻辑（如 `useLottery`）需有完整单元测试覆盖

### 状态管理
- 使用 Composables 模式封装可复用逻辑
- 数据持久化通过 `useStorage` 封装 localStorage 操作
- 参与者数据格式：
  ```typescript
  interface Participant {
    id: number
    name: string
    number: string  // 3 位编号，如 "001"
  }
  ```

### 组件通信
- 父子组件：`props` + `emit`
- 跨组件：通过 `App.vue` 统一状态管理

---

## 关键实现细节

### 滚轮动画 (Wheel.vue)
- 单列垂直滚动设计
- 动画使用 CSS `transform: translateY()` + `cubic-bezier` 缓动
- 编号池重复生成以支持多圈旋转动画

### 抽奖逻辑 (useLottery.ts)
- 唯一 ID 生成器：自增计数器
- 参与者编号：基于数组索引动态计算（删除后自动重排）
- 防重复中奖：通过 `allowRepeat` 设置控制

### 数据持久化
- 参与者列表：`lottery_participants`
- 历史记录：`lottery_history`
- 设置：使用默认值（未持久化）

---

## 已知文件说明

| 文件 | 说明 |
|------|------|
| `TASKS.md` | Bug 修复任务清单与记录 |
| `tsconfig.node.json` | Node 环境 TypeScript 配置 |
| `vitest.config.ts` | Vitest 测试配置（含路径别名）
