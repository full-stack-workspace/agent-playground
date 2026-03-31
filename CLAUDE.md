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

# Run deepresearch-agent
pnpm dev:deepresearch "<research topic>"

# Run article-research-agent
pnpm dev:article-research
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
| `@agent-playground/deepresearch-agent` | Research topic analysis and guidance | `@anthropic-ai/sdk` |
| `@agent-playground/article-research-agent` | Multi-agent article research with lead/sub-agent orchestration | `@anthropic-ai/claude-agent-sdk` |

### Key Patterns
- **Two SDK approaches**:
  - Direct API via `@anthropic-ai/sdk` - used by deepresearch-agent
  - Agent SDK via `@anthropic-ai/claude-agent-sdk` - used by basic-example, article-research-agent (supports tools, sessions, multi-agent orchestration)
- **Environment Setup**: Each package requires `ANTHROPIC_API_KEY` in `.env` (copy from `.env.example`)
- **TypeScript**: Target ES2022, module ESNext with bundler resolution, strict mode enabled
- **Execution**: Uses `tsx` for development, `tsc` for production builds
- **Module System**: All packages use `type: "module"`
