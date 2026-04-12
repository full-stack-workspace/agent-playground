# agent-playground

一个用于研究、探索多种 AI Agent 构建模式的实验场。在实践中学习，为生产环境构建 Agent 做技术储备。

## 理念

这不是一个开箱即用的产品，而是持续演进的技术实验。

每个 Agent 都是对一种构建模式的探索：多 Agent 编排、工具调用、上下文管理、输出结构化、Agent 安全性等。通过实践对比不同方案的优劣，为真实场景的选择提供依据。方案不绑定特定框架——当有更好的选择时，重构是正常的。

## Agent 一览

| 包 | 描述 | 核心模式 |
|---|---|---|
| `basic-example` | TUI 聊天界面和入门示例 | 流式输出、Session 管理、MCP 工具 |
| `deepresearch-agent` | 深度研究助手，生成带图表的 PDF 报告 | Lead Agent + 多 Subagent 流水线、并行研究 |
| `article-research-agent` | 多角度文章分析，带质量评分 | Lead Agent + Subagent、多维度研究、结果聚合 |
| `insight-linter` | 技术博客文章评审与优化建议 | 多维度评分、标题与 SEO 优化；面向 OpenClaw 与本地 Claude Code 自动化审稿场景 |

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### 安装

```bash
pnpm install
```

### 配置 API Key

每个 Agent 需要单独配置 API Key：

```bash
# 为 basic-example 配置
cp packages/basic-example/.env.example packages/basic-example/.env
# 编辑 packages/basic-example/.env，填入你的 ANTHROPIC_API_KEY

# 为 deepresearch-agent 配置
cp packages/deepresearch-agent/.env.example packages/deepresearch-agent/.env

# 为 article-research-agent 配置
cp packages/article-research-agent/.env.example packages/article-research-agent/.env

# 为 insight-linter 配置
cp packages/insight-linter/.env.example packages/insight-linter/.env
```

### 运行

```bash
# basic-example — TUI 聊天界面，支持 WebSearch 工具
pnpm dev:basic

# deepresearch-agent — 深度研究助手
pnpm dev:deepresearch "研究量子计算的最新进展"

# article-research-agent — 文章多角度分析
pnpm dev:article-research
```

## 项目结构

```
agent-playground/
├── packages/
│   ├── basic-example/        # TUI 聊天与入门示例
│   ├── deepresearch-agent/   # 深度研究助手
│   ├── article-research-agent/# 文章多角度分析
│   └── insight-linter/       # 技术文章评审
├── package.json
└── pnpm-workspace.yaml
```

## 开发命令

```bash
# 类型检查（所有包）
pnpm typecheck

# 在单个包中开发
cd packages/<package-name>
pnpm dev
pnpm build
pnpm typecheck
```

## 参与

这是一个持续探索的项目。欢迎尝试任何 Agent，在实践中发现新问题、提出新想法。
