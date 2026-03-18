# Agent Playground 初始化实施计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 初始化 pnpm workspace 项目，创建三个独立的 Agent 子包，每个都能本地运行

**Architecture:** 使用方案 A（最小可行架构），每个 Agent 完全独立配置，无共享配置

**Tech Stack:** pnpm workspace, TypeScript 5+, Node.js 18+, ts-node, @anthropic-ai/sdk, @anthropic-ai/claude-agent-sdk, langchain, @langchain/langgraph

---

## Chunk 1: 根目录配置

### Task 1: 创建根目录配置文件

**Files:**
- Create: `pnpm-workspace.yaml`
- Create: `package.json`
- Create: `.gitignore`

- [ ] **Step 1: 创建 packages 目录**

```bash
mkdir -p packages
```

- [ ] **Step 2: 创建 pnpm-workspace.yaml**

```yaml
packages:
  - 'packages/*'
```

- [ ] **Step 3: 创建根 package.json**

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

- [ ] **Step 4: 创建 .gitignore**

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

- [ ] **Step 5: 提交根目录配置**

```bash
git add pnpm-workspace.yaml package.json .gitignore
git commit -m "Init: Add root workspace configuration"
```

---

## Chunk 2: 创建 code-agent 包

### Task 2: 创建 code-agent 目录和配置

**Files:**
- Create: `packages/code-agent/package.json`
- Create: `packages/code-agent/tsconfig.json`
- Create: `packages/code-agent/.env.example`
- Create: `packages/code-agent/src/index.ts`

- [ ] **Step 1: 创建 packages/code-agent/package.json**

```json
{
  "name": "@agent-playground/code-agent",
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
    "@anthropic-ai/sdk": "^0.79.0",
    "@anthropic-ai/claude-agent-sdk": "^0.2.77",
    "@langchain/langgraph": "^1.2.3",
    "langchain": "^1.2.34",
    "dotenv": "^16.4.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "ts-node": "^10.9.2",
    "typescript": "^5.3.0"
  }
}
```

- [ ] **Step 2: 创建 packages/code-agent/tsconfig.json**

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

- [ ] **Step 3: 创建 packages/code-agent/.env.example**

```
ANTHROPIC_API_KEY=your_api_key_here
```

- [ ] **Step 4: 创建 packages/code-agent/src/index.ts**

```typescript
import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error('Error: ANTHROPIC_API_KEY is not set in .env file');
  process.exit(1);
}

const client = new Anthropic({ apiKey });

const SYSTEM_PROMPT = `你是一个专业的代码助手。你的任务是帮助用户：
1. 解释代码的功能和逻辑
2. 提供代码改进建议
3. 修复代码中的 bug
4. 编写新的代码片段

请用清晰、简洁的语言回答，并在必要时提供代码示例。`;

async function main() {
  const args = process.argv.slice(2);
  const userInput = args.join(' ');

  if (!userInput) {
    console.log('用法: pnpm dev "<你的代码问题或代码片段>"');
    process.exit(0);
  }

  console.log('\n正在思考...\n');

  try {
    const message = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userInput }],
    });

    const response = message.content[0];
    if (response.type === 'text') {
      console.log(response.text);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
```

- [ ] **Step 5: 提交 code-agent 初始文件**

```bash
git add packages/code-agent/package.json packages/code-agent/tsconfig.json packages/code-agent/.env.example packages/code-agent/src/index.ts
git commit -m "Init: Add code-agent package"
```

---

## Chunk 3: 创建 deepsearch-agent 包

### Task 3: 创建 deepsearch-agent 目录和配置

**Files:**
- Create: `packages/deepsearch-agent/package.json`
- Create: `packages/deepsearch-agent/tsconfig.json`
- Create: `packages/deepsearch-agent/.env.example`
- Create: `packages/deepsearch-agent/src/index.ts`

- [ ] **Step 1: 创建 packages/deepsearch-agent/package.json**

```json
{
  "name": "@agent-playground/deepsearch-agent",
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
    "@anthropic-ai/sdk": "^0.79.0",
    "@anthropic-ai/claude-agent-sdk": "^0.2.77",
    "@langchain/langgraph": "^1.2.3",
    "langchain": "^1.2.34",
    "dotenv": "^16.4.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "ts-node": "^10.9.2",
    "typescript": "^5.3.0"
  }
}
```

- [ ] **Step 2: 创建 packages/deepsearch-agent/tsconfig.json**

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

- [ ] **Step 3: 创建 packages/deepsearch-agent/.env.example**

```
ANTHROPIC_API_KEY=your_api_key_here
```

- [ ] **Step 4: 创建 packages/deepsearch-agent/src/index.ts**

```typescript
import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error('Error: ANTHROPIC_API_KEY is not set in .env file');
  process.exit(1);
}

const client = new Anthropic({ apiKey });

const SYSTEM_PROMPT = `你是一个专业的研究助手。你的任务是帮助用户：
1. 分析研究主题，提供结构化的研究思路
2. 建议研究方向和参考资料
3. 帮助整理研究笔记和思路
4. 提供多角度的思考建议

请用清晰、有条理的方式回答，使用列表或分点来组织内容。`;

async function main() {
  const args = process.argv.slice(2);
  const userInput = args.join(' ');

  if (!userInput) {
    console.log('用法: pnpm dev "<你的研究主题或问题>"');
    process.exit(0);
  }

  console.log('\n正在思考...\n');

  try {
    const message = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userInput }],
    });

    const response = message.content[0];
    if (response.type === 'text') {
      console.log(response.text);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
```

- [ ] **Step 5: 提交 deepsearch-agent 初始文件**

```bash
git add packages/deepsearch-agent/package.json packages/deepsearch-agent/tsconfig.json packages/deepsearch-agent/.env.example packages/deepsearch-agent/src/index.ts
git commit -m "Init: Add deepsearch-agent package"
```

---

## Chunk 4: 创建 summary-agent 包

### Task 4: 创建 summary-agent 目录和配置

**Files:**
- Create: `packages/summary-agent/package.json`
- Create: `packages/summary-agent/tsconfig.json`
- Create: `packages/summary-agent/.env.example`
- Create: `packages/summary-agent/src/index.ts`

- [ ] **Step 1: 创建 packages/summary-agent/package.json**

```json
{
  "name": "@agent-playground/summary-agent",
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
    "@anthropic-ai/sdk": "^0.79.0",
    "@anthropic-ai/claude-agent-sdk": "^0.2.77",
    "@langchain/langgraph": "^1.2.3",
    "langchain": "^1.2.34",
    "dotenv": "^16.4.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "ts-node": "^10.9.2",
    "typescript": "^5.3.0"
  }
}
```

- [ ] **Step 2: 创建 packages/summary-agent/tsconfig.json**

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

- [ ] **Step 3: 创建 packages/summary-agent/.env.example**

```
ANTHROPIC_API_KEY=your_api_key_here
```

- [ ] **Step 4: 创建 packages/summary-agent/src/index.ts**

```typescript
import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error('Error: ANTHROPIC_API_KEY is not set in .env file');
  process.exit(1);
}

const client = new Anthropic({ apiKey });

const SYSTEM_PROMPT = `你是一个专业的文本摘要助手。你的任务是：
1. 阅读用户提供的文本
2. 提取关键要点
3. 生成简洁、准确的摘要
4. 使用要点列表形式呈现

请确保摘要涵盖原文的主要内容，避免遗漏重要信息。`;

async function readInput(input: string): Promise<string> {
  try {
    const stats = await fs.stat(input);
    if (stats.isFile()) {
      return await fs.readFile(input, 'utf-8');
    }
  } catch {
    // 不是文件路径，直接返回输入文本
  }
  return input;
}

async function main() {
  const args = process.argv.slice(2);
  const userInput = args.join(' ');

  if (!userInput) {
    console.log('用法: pnpm dev "<文本内容或文件路径>"');
    process.exit(0);
  }

  console.log('\n正在处理...\n');

  try {
    const text = await readInput(userInput);

    const message = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `请总结以下文本：\n\n${text}` }],
    });

    const response = message.content[0];
    if (response.type === 'text') {
      console.log(response.text);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
```

- [ ] **Step 5: 提交 summary-agent 初始文件**

```bash
git add packages/summary-agent/package.json packages/summary-agent/tsconfig.json packages/summary-agent/.env.example packages/summary-agent/src/index.ts
git commit -m "Init: Add summary-agent package"
```

---

## Chunk 5: 安装依赖和测试

### Task 5: 安装依赖并验证项目

**Files:**
- Create: `README.md`

- [ ] **Step 1: 运行 pnpm install**

```bash
pnpm install
```

- [ ] **Step 2: 运行 typecheck 验证 TypeScript 配置**

```bash
pnpm typecheck
```

Expected: 无错误输出

- [ ] **Step 3: 为每个 Agent 创建 .env 文件（如果用户有 API key）**

说明：用户需要复制 `.env.example` 为 `.env` 并填入自己的 `ANTHROPIC_API_KEY`

- [ ] **Step 4: 创建 README.md 添加使用说明**

```markdown
# agent-playground

使用 pnpm workspace 管理的 TypeScript + Node.js Agent 开发项目。

## 开发环境

- Node.js >= 18.0.0
- pnpm >= 8.0.0

## 安装依赖

```bash
pnpm install
```

## 配置 API Key

每个 Agent 需要配置 Anthropic API Key：

```bash
# 为 code-agent 配置
cp packages/code-agent/.env.example packages/code-agent/.env
# 编辑 packages/code-agent/.env，填入你的 ANTHROPIC_API_KEY

# 同样为其他 Agent 配置
cp packages/deepsearch-agent/.env.example packages/deepsearch-agent/.env
cp packages/summary-agent/.env.example packages/summary-agent/.env
```

## 运行 Agent

```bash
# 运行 code-agent
pnpm dev:code "解释这段代码..."

# 运行 deepsearch-agent
pnpm dev:deepsearch "研究主题..."

# 运行 summary-agent
pnpm dev:summary "需要总结的文本或文件路径"
```

## 包说明

- `@agent-playground/code-agent` - 代码助手
- `@agent-playground/deepsearch-agent` - 深度研究智能体
- `@agent-playground/summary-agent` - 文章摘要总结
```

- [ ] **Step 5: 提交 README**

```bash
git add README.md
git commit -m "Docs: Add README with usage instructions"
```

---
