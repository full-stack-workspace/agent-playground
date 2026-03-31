# @agent-playground/article-research-agent

多智能体协作的文章分析 Agent，通过 Lead Agent 编排多个专业子 Agent，对文章进行多角度深度研究、结构化摘要和质量评分。

## 功能特性

- **多智能体协作** - Lead Agent 统一调度，多个子 Agent 并行/串行执行
- **多角度分析** - 每篇文章支持 3-4 个独立分析维度，并行研究
- **三级处理流程** - 研究员(并行) → 摘要员 → 评分员
- **会话追踪** - 完整的对话日志和工具调用记录
- **环境变量保护** - Hook 机制防止子 Agent 误写敏感文件

## 架构设计

```
用户请求
    │
    ▼
Lead Agent（主控 Agent）
    │
    ├──▶ article-researcher（研究员）× N（并行）
    │       └── 按角度深度分析文章，输出 research_notes/
    │
    ├──▶ article-summarizer（摘要员）
    │       └── 合并多角度研究，输出 summaries/
    │
    └──▶ article-scorer（评分员）
            └── 质量评分，输出 final_reports/
```

### 子 Agent 职责

| Agent | 工具 | 职责 |
|-------|------|------|
| `article-researcher` | Write | 从单一角度深度分析文章，提取亮点和标签 |
| `article-summarizer` | Glob, Read, Grep, Bash, Write, Edit | 合并多角度笔记，去重并生成综合摘要 |
| `article-scorer` | Skill, Write, Glob, Read, Bash | 评估质量（10分制），生成最终报告 |

## 安装

```bash
# 在根目录安装
pnpm install
```

## 配置

```bash
cp .env.example .env
# 编辑 .env 文件，填入你的 ANTHROPIC_API_KEY
```

## 运行

```bash
# 方式一：从根目录运行
pnpm dev:article-research

# 方式二：在当前目录运行
cd packages/article-research-agent
pnpm dev
```

## 输入数据

编辑 `src/input-data.ts` 中的 `inputArticles` 数组，添加要分析的文章：

```typescript
export const inputArticles = [
    {
        "id": "article-001",
        "url": "https://example.com/article",
        "title": "文章标题",
        "content": "文章完整内容..."
    },
    // 更多文章...
];
```

## 输出结构

```
output/
├── research_notes/          # 研究员输出
│   └── [id]_[angle].md     # 每篇文章每个角度一份
├── summaries/               # 摘要员输出
│   └── [id]-summary.md     # 每篇文章综合摘要一份
└── final_reports/          # 评分员输出
    └── [id]-final.md       # 每篇文章最终报告一份
```

## 开发命令

```bash
# 开发模式运行
pnpm dev

# 构建
pnpm build

# 类型检查
pnpm typecheck
```

## 项目结构

```
article-research-agent/
├── src/
│   ├── index.ts                  # 主入口，TUI 聊天界面
│   ├── agent.config.ts           # 子 Agent 配置和 Hook
│   ├── input-data.ts             # 输入文章数据
│   ├── hooks/
│   │   └── protect-env-files.ts  # 保护环境变量文件
│   ├── prompts/
│   │   ├── lead-agent.ts         # 主控 Agent 提示词
│   │   ├── article-researcher.ts # 研究员提示词
│   │   ├── article-summarizer.ts # 摘要员提示词
│   │   └── article-scorer.ts     # 评分员提示词
│   └── utils/
│       ├── message_handler.ts    # 消息处理
│       ├── subagent_tracker.ts   # 子 Agent 执行追踪
│       ├── transcript.ts         # 对话记录
│       └── prepare-tracker.ts   # 初始化追踪器
├── output/                      # 分析结果输出目录
├── logs/                        # 会话日志
├── package.json
├── tsconfig.json
└── README.md
```

## 技术栈

- **@anthropic-ai/claude-agent-sdk** - Agent SDK，支持多 Agent 编排和 Task 工具
- **chalk** - 终端彩色输出
- **dotenv** - 环境变量加载
- **TypeScript** - 类型安全
