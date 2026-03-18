# Agent Playground 项目设计文档

**日期：** 2026-03-18
**状态：** 设计中

## 概述

初始化一个使用 pnpm workspace 管理的 TypeScript + Node.js Agent 开发项目，包含三个独立的 Agent 子包。

## 目标

- 使用 pnpm workspace 管理多个 packages
- 每个模块使用 TypeScript 和 Node.js 开发
- 每个 Agent 能在本地独立启动和运行
- 每个 Agent 包之间互不影响

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
    ├── deepsearch-agent/     # 深度深度研究智能体
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

### deepsearch-agent
- **用途：** 深度研究智能体 - 辅助研究工作
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
  "description": "Multi-agent playground using pnpm workspace",
  "engines": {
    "node": ">=18.0.0"
  },
  "scripts": {
    "dev:code": "pnpm --filter @agent-playground/code-agent dev",
    "dev:deepsearch": "pnpm --filter @agent-playground/deepsearch-agent dev",
    "dev:summary": "pnpm --filter @agent-playground/summary-agent dev",
    "typecheck": "pnpm -r typecheck"
  }
}
```

#### .gitignore
```
# Dependencies
node_modules/

# Build output
dist/

# Environment variables
.env
.env.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
```

### 单个 Agent 包配置

三个 Agent 包都使用 `@agent-playground/` 作用域命名（私有包，无需发布到 npm registry）：
- `@agent-playground/code-agent`
- `@agent-playground/deepsearch-agent`
- `@agent-playground/summary-agent`

**实现注意事项：**
- 使用 ESM 时，相对导入需要显式 `.js` 扩展名
- `dotenv` 使用方式：在 `src/index.ts` 顶部添加 `import 'dotenv/config'`
- `summary-agent` 输入处理：先检查是否为有效文件路径，是则读取文件内容，否则直接使用输入文本

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
    "build": "tsc",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.24.0",
    "dotenv": "^16.4.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "ts-node": "^10.9.2",
    "typescript": "^5.3.0"
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
  "ts-node": {
    "esm": true,
    "experimentalSpecifierResolution": "node"
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
每个 Agent 的入口文件，实现以下基础功能：
1. 从 `.env` 文件加载 `ANTHROPIC_API_KEY` 环境变量
2. 初始化 Anthropic SDK 客户端
3. 提供一个简单的命令行交互：
   - 接收用户输入（通过命令行参数或 stdin）
   - 调用 Claude API（使用 claude-3-haiku 模型）
   - 输出 AI 回复到控制台
4. 包含基础的错误处理

**Agent 差异化（除系统提示词外）：**

- **code-agent**：
  - 输入：代码片段或编程问题
  - 输出：代码解释、改进建议、或修复后的代码
  - CLI：`pnpm dev "<code or question>"`

- **deepsearch-agent**：
  - 输入：研究主题或问题
  - 输出：结构化的研究思路、参考方向
  - CLI：`pnpm dev "<research topic>"`

- **summary-agent**：
  - 输入：长文本或文件路径
  - 输出：简明的要点摘要
  - CLI：`pnpm dev "<text or file path>"`

每个 Agent 有不同的系统提示词（system prompt）：
- `code-agent`：专注于代码相关任务
- `deepsearch-agent`：专注于研究相关任务
- `summary-agent`：专注于文本摘要任务

## 后续可演进方向

1. 添加共享包 `packages/shared` 用于公共代码
2. 引入测试框架（vitest/jest）
3. 添加统一的 lint/format 配置
4. 引入 Agent 框架（LangChain 等）
