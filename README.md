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
