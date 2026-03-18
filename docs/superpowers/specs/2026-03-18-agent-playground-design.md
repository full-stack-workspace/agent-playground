# Agent Playground 项目设计文档

**日期：** 2026-03-18
**状态：** 设计中

## 概述

初始化一个使用 pnpm workspace 管理的 TypeScript + Node.js Agent 开发项目，包含三个独立的 Agent 子包。

## 目标

- 使用 pnpm workspace 管理多个 packages
- 每个模块使用 TypeScript 和 Node.js 开发
- 每个 Agent 能在本地独立启动和运行
- 三个 Agent 包之间互不影响

## 项目结构

```
agent-playground/
├── package.json              # 根 package.json，定义 pnpm workspace
├── pnpm-workspace.yaml       # pnpm workspace 配置
├── .gitignore                # Git 忽略文件
└── packages/
    ├── code-agent/           # 代码助手 Agent
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── .env.example
    │   └── src/
    │       └── index.ts
    ├── research-agent/       # 研究智能体
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── .env.example
    │   └── src/
    │       └── index.ts
    └── summary-agent/        # 文章摘要总结 Agent
        ├── package.json
        ├── tsconfig.json
        ├── .env.example
        └── src/
            └── index.ts
```

## 技术栈

| 组件 | 选择 | 说明 |
|------|------|------|
| 包管理 | pnpm + pnpm workspaces | 支持 monorepo 结构 |
| 语言 | TypeScript 5+ | 类型安全 |
| 运行时 | Node.js 18+ | LTS 版本 |
| TS 运行 | ts-node + typescript | 直接运行 TypeScript |
| LLM SDK | @anthropic-ai/sdk | Anthropic 官方 SDK |

## 包说明

### code-agent
- **用途：** 代码助手 - 帮助编写、审查、解释代码
- **入口：** `src/index.ts`

### research-agent
- **用途：** 研究智能体 - 辅助研究工作
- **入口：** `src/index.ts`

### summary-agent
- **用途：** 文章摘要总结 - 总结文章/文档内容
- **入口：** `src/index.ts`

## 设计原则

1. **完全独立：** 每个 Agent 包有自己的依赖、配置、环境变量，互不影响
2. **最小可行：** 初始版本保持简单，后续可演进
3. **可运行：** 每个 Agent 都能独立启动并运行基础示例

## 配置详情

### 根目录配置

#### pnpm-workspace.yaml
```yaml
packages:
  - 'packages/*'
```

#### 根 package.json
```json
{
  "name": "agent-playground",
  "private": true,
  "version": "1.0.0",
  "description": "Multi-agent playground using pnpm workspace"
}
```

### 单个 Agent 包配置

#### package.json
```json
{
  "name": "@agent-playground/<agent-name>",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "ts-node --esm src/index.ts",
    "start": "node --loader ts-node/esm src/index.ts",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.x.x",
    "dotenv": "^16.x.x"
  },
  "devDependencies": {
    "@types/node": "^20.x.x",
    "ts-node": "^10.x.x",
    "typescript": "^5.x.x"
  }
}
```

#### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

#### .env.example
```
ANTHROPIC_API_KEY=your_api_key_here
```

#### src/index.ts
基础的 Anthropic SDK 调用示例，包含环境变量加载和简单的对话功能。

## 后续可演进方向

1. 添加共享包 `packages/shared` 用于公共代码
2. 引入测试框架（vitest/jest）
3. 添加统一的 lint/format 配置
4. 引入 Agent 框架（LangChain 等）
