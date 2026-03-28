# agent-playground

使用 pnpm workspace 管理的 TypeScript + Node.js AI Agent 开发项目，展示多种构建智能体的方式。

## 开发环境

- Node.js >= 18.0.0
- pnpm >= 8.0.0

## 安装依赖

```bash
pnpm install
```

## 配置 API Key

每个 Agent 需要配置 API Key：

```bash
# 为 basic-example 配置
cp packages/basic-example/.env.example packages/basic-example/.env
# 编辑 packages/basic-example/.env，填入你的 ANTHROPIC_API_KEY

# 为 code-agent 配置
cp packages/code-agent/.env.example packages/code-agent/.env

# 为 deepresearch-agent 配置
cp packages/deepresearch-agent/.env.example packages/deepresearch-agent/.env

# 为 summary-agent 配置
cp packages/summary-agent/.env.example packages/summary-agent/.env
```

## 运行 Agent

```bash
# 运行 basic-example（TUI 聊天界面，支持 WebSearch 工具）
pnpm dev:basic

# 运行 code-agent（代码助手）
pnpm dev:code "解释这段代码的功能"

# 运行 deepresearch-agent（深度研究助手）
pnpm dev:deepresearch "研究量子计算的最新进展"

# 运行 summary-agent（文本总结）
pnpm dev:summary "需要总结的文本或文件路径"
```

## 包说明

| 包名 | 描述 | 进展状态 |
|------|------|----------|
| `@agent-playground/basic-example` | 基础示例 - 包含查询示例、会话示例和 TUI 聊天界面，支持 WebSearch/WebFetch 工具 | ✅ 已完成 |
| `@agent-playground/code-agent` | 代码助手 - 解释代码、提供改进建议、修复 bug、编写新代码 | ⏳ 进行中 |
| `@agent-playground/deepresearch-agent` | 深度研究智能体 - 分析研究主题、提供研究方向建议 | ✅ 已完成 |
| `@agent-playground/summary-agent` | 文章摘要总结 - 从文本或文件中提取关键点并生成摘要 | ⏳ 进行中 |

## 项目结构

```
agent-playground/
├── packages/
│   ├── basic-example/       # 基础示例和 TUI 聊天
│   ├── code-agent/          # 代码助手
│   ├── deepresearch-agent/  # 深度研究助手
│   └── summary-agent/       # 文本摘要助手
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

## 技术栈

- **TypeScript** - 类型安全的 JavaScript
- **@anthropic-ai/sdk** - Claude API 官方 SDK
- **@anthropic-ai/claude-agent-sdk** - 高级 Agent SDK（支持工具和会话）
- **pnpm** - 快速、节省磁盘空间的包管理器
- **tsx** - TypeScript 执行引擎
- **dotenv** - 环境变量管理
- **chalk** - 终端彩色输出

## 开发命令

```bash
# 类型检查
pnpm typecheck

# 在单个包中开发
cd packages/basic-example
pnpm dev
pnpm build
pnpm typecheck
```
