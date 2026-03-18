# @agent-playground/basic-example

Claude Agent SDK 基础示例包，展示多种使用方式：简单查询、会话查询和带工具支持的 TUI 聊天界面。

## 功能特性

- **简单查询示例** - 一次性问答
- **会话查询示例** - 支持上下文的多轮对话
- **TUI 聊天界面** - 终端用户界面，支持流式输出
- **工具集成** - WebSearch 和 WebFetch 工具支持
- **实时流式显示** - 思考过程和文本分段显示
- ** stall 指示器** - 空闲时的光标动画

## 安装

```bash
# 在根目录安装
pnpm install
```

## 配置

复制环境变量示例文件并配置 API Key：

```bash
cp .env.example .env
# 编辑 .env 文件，填入你的 ANTHROPIC_API_KEY
```

## 运行

### 方式一：从根目录运行

```bash
pnpm dev:basic
```

### 方式二：在当前目录运行

```bash
pnpm dev
```

## 使用示例

### 修改运行模式

编辑 `src/index.ts` 来切换不同的运行模式：

```typescript
// 1. 简单查询示例
await queryExample();

// 2. 会话查询示例
await sessionQueryExample();

// 3. TUI 聊天（无工具）
await tuiChat({
    tuiPrompt: 'User:',
});

// 4. TUI 聊天（带 WebSearch 和 WebFetch 工具）
await tuiChat({
    tuiPrompt: 'User: ',
    allowedTools: ['WebSearch', 'WebFetch'],
    includePartialMessages: true,
});
```

### TUI 聊天命令

运行后直接在终端输入问题即可：

```
User: 搜索一下最新的 AI 新闻
User: 帮我读取这个网页 https://example.com
```

## 项目结构

```
basic-example/
├── src/
│   ├── index.ts              # 主入口文件
│   ├── query-example.ts      # 查询示例
│   └── tui-chat/
│       ├── index.ts          # TUI 界面实现
│       └── chat-example.ts   # 流式/非流式聊天处理器
├── package.json
├── tsconfig.json
└── README.md
```

## 技术栈

- **@anthropic-ai/claude-agent-sdk** - Agent SDK，提供会话管理和工具支持
- **chalk** - 终端彩色输出
- **dotenv** - 环境变量加载
- **TypeScript** - 类型安全

## 开发命令

```bash
# 开发模式运行
pnpm dev

# 构建
pnpm build

# 类型检查
pnpm typecheck

# 运行构建后的代码
pnpm start
```
