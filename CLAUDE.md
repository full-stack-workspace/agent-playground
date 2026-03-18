# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Installation
```bash
pnpm install
```

### Development
```bash
# Run basic-example (TUI chat with WebSearch tools)
pnpm dev:basic

# Run code-agent
pnpm dev:code "<your question>"

# Run deepresearch-agent
pnpm dev:deepresearch "<research topic>"

# Run summary-agent
pnpm dev:summary "<text or file path>"
```

### Build & Type Check
```bash
# Type check all packages
pnpm typecheck

# Build a specific package
cd packages/<package-name>
pnpm build
pnpm typecheck
```

### Individual Package Scripts
Each package has consistent scripts:
```bash
pnpm dev        # Run with tsx
pnpm start      # Run compiled JavaScript
pnpm build      # Compile TypeScript to ./dist
pnpm typecheck  # Type check without emitting
```

## Project Architecture

### Monorepo Structure
This is a pnpm workspace monorepo. All packages live in `packages/*`.

### Packages
| Package | Purpose | SDK Used |
|---------|---------|----------|
| `@agent-playground/basic-example` | TUI chat, query examples, session management | `@anthropic-ai/claude-agent-sdk` |
| `@agent-playground/code-agent` | Code explanation, improvement, bug fixes | `@anthropic-ai/sdk` |
| `@agent-playground/deepresearch-agent` | Research topic analysis and guidance | `@anthropic-ai/sdk` |
| `@agent-playground/summary-agent` | Text summarization from text or files | `@anthropic-ai/sdk` |

### Key Patterns
- **Two SDK approaches**:
  - Direct API via `@anthropic-ai/sdk` - used by code-agent, deepresearch-agent, summary-agent
  - Agent SDK via `@anthropic-ai/claude-agent-sdk` - used by basic-example (supports tools, sessions)
- **Environment Setup**: Each package requires `ANTHROPIC_API_KEY` in `.env` (copy from `.env.example`)
- **TypeScript**: Target ES2022, module ESNext with bundler resolution, strict mode enabled
- **Execution**: Uses `tsx` for development, `tsc` for production builds
- **Module System**: All packages use `type: "module"`
