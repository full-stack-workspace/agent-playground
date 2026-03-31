/**
 * @file Subagent Tracker - 通过 hooks 和消息流解析，实现对 subagent 工具调用的全面追踪
 * @file English: Comprehensive tracking for subagent tool calls using hooks and message stream
 * @detail 从 claude code agent sdk demo 的 python 版本翻译而来，用于在 Node.js 中追踪 subagent 工具调用
 */

import * as fs from "fs";
import { join, basename } from "path";
import { WriteStream } from "fs";
import type { TranscriptWriter } from './transcript'

// ============================================================================
// Types / 接口类型
// ============================================================================

/**
 * 单个工具调用的记录 / Record of a single tool call
 */
export interface ToolCallRecord {
    timestamp: string;
    toolName: string;
    toolInput: Record<string, unknown>;
    toolUseId: string;
    subagentType: string;
    parentToolUseId?: string;
    toolOutput?: unknown;
    error?: string;
}

/**
 * Subagent 执行会话的信息 / Information about a subagent execution session
 */
export interface SubagentSession {
    subagentType: string;
    parentToolUseId: string;
    spawnedAt: string;
    description: string;
    promptPreview: string;
    subagentId: string; // 唯一标识，如 "RESEARCHER-1" / Unique identifier like "RESEARCHER-1"
    toolCalls: ToolCallRecord[];
}

/**
 * Hook 输入的基础接口 / Base interface for hook input
 */
export interface HookInput {
    tool_name?: string;
    tool_input?: Record<string, unknown>;
    tool_response?: unknown;
    [key: string]: unknown;
}

/**
 * Hook 上下文接口 / Hook context interface
 */
export interface HookContext {
    [key: string]: unknown;
}

/**
 * JSONL 日志条目结构 / JSONL log entry structure
 */
interface JsonlLogEntry {
    event: string;
    timestamp: string;
    tool_use_id: string;
    agent_id: string;
    agent_type: string;
    tool_name?: string;
    tool_input?: Record<string, unknown>;
    parent_tool_use_id?: string;
    success?: boolean;
    error?: string;
    output_size?: number;
}

// ============================================================================
// SubagentTracker Class / SubagentTracker 类
// ============================================================================

/**
 * 追踪所有 subagent 工具调用的类 / Tracks all tool calls made by subagents
 *
 * 此追踪器: / This tracker:
 * 1. 监控消息流以检测通过 Task 工具产生的 subagent / Monitors message stream to detect subagent spawns via Task tool
 * 2. 使用 hooks (PreToolUse/PostToolUse) 捕获所有工具调用 / Uses hooks to capture all tool invocations
 * 3. 将工具调用与其原始 subagent 关联 / Associates tool calls with their originating subagent
 * 4. 将工具使用记录到控制台和转录文件 / Logs tool usage to console and transcript files
 */
export class SubagentTracker {
    // Map: parent_tool_use_id -> SubagentSession，存储会话信息
    private sessions: Map<string, SubagentSession> = new Map();

    // Map: tool_use_id -> ToolCallRecord，用于在 post hook 中快速查找
    private toolCallRecords: Map<string, ToolCallRecord> = new Map();

    // 当前执行上下文（来自消息流）/ Current execution context (from message stream)
    private _currentParentId?: string;

    // 每个 subagent 类型的计数器，用于生成唯一 ID / Counter for each subagent type to create unique IDs
    private subagentCounters: Record<string, number> = {};

    // Transcript writer 用于记录干净输出 / Transcript writer for logging clean output
    private transcriptWriter?: TranscriptWriter;

    // 工具调用详细日志（JSONL 格式）/ Tool call detail log (JSONL format)
    private toolLogFile?: WriteStream;

    constructor(
        transcriptWriter?: TranscriptWriter | null,
        sessionDir?: string
    ) {
        this.transcriptWriter = transcriptWriter ?? undefined;

        // 如果有 sessionDir，则创建 JSONL 日志文件 / Create JSONL log file if sessionDir provided
        if (sessionDir) {
            const toolLogPath = join(sessionDir, "tool_calls.jsonl");
            this.toolLogFile = fs.createWriteStream(toolLogPath, { encoding: "utf-8" });
        }

        console.debug("[SubagentTracker] Initialized");
    }

    /**
     * 注册从消息流检测到的新 subagent 产生
     * Register a new subagent spawn detected from the message stream
     *
     * @param toolUseId - Task 工具使用块的 ID / The ID of the Task tool use block
     * @param subagentType - Subagent 类型 (如 'researcher', 'report-writer')
     * @param description - 任务的简要描述 / Brief description of the task
     * @param prompt - 给 subagent 的完整提示词 / The full prompt given to the subagent
     * @returns 生成的 subagent_id (如 'RESEARCHER-1')
     */
    registerSubagentSpawn(
        toolUseId: string,
        subagentType: string,
        description: string,
        prompt: string
    ): string {
        // 递增该 subagent 类型的计数器并创建唯一 ID / Increment counter and create unique ID
        const newCount = (this.subagentCounters[subagentType] || 0) + 1;
        this.subagentCounters[subagentType] = newCount;
        const subagentId = `${subagentType.toUpperCase()}-${newCount}`;

        const session: SubagentSession = {
            subagentType,
            parentToolUseId: toolUseId,
            spawnedAt: new Date().toISOString(),
            description,
            promptPreview: prompt.length > 200 ? prompt.slice(0, 200) + "..." : prompt,
            subagentId,
            toolCalls: [],
        };

        this.sessions.set(toolUseId, session);

        // 记录 spawn 事件 / Log spawn event
        const divider = "=".repeat(60);
        console.info(divider);
        console.info(`🚀 SUBAGENT SPAWNED: ${subagentId}`);
        console.info(divider);
        console.info(`Task: ${description}`);
        console.info(divider);

        return subagentId;
    }

    /**
     * 从消息流更新当前执行上下文 / Update the current execution context from message stream
     *
     * @param parentToolUseId - 当前消息中的父工具使用 ID / The parent tool use ID from the current message
     */
    setCurrentContext(parentToolUseId?: string): void {
        this._currentParentId = parentToolUseId;
    }

    /**
     * 辅助方法：将工具使用记录到控制台、转录文件和详细日志
     * Helper method to log tool use to console, transcript, and detailed log
     *
     * @param agentLabel - Agent 的标签 (如 "RESEARCHER-1", "MAIN AGENT")
     * @param toolName - 被使用工具的名称 / Name of the tool being used
     * @param toolInput - 可选的工具输入参数 / Optional tool input parameters
     */
    private _logToolUse(
        agentLabel: string,
        toolName: string,
        toolInput?: Record<string, unknown>
    ): void {
        // 控制台和转录文件：简短消息 / Console and transcript: brief message
        const message = `\n[${agentLabel}] → ${toolName}`;
        console.info(message.trim());

        if (this.transcriptWriter) {
            this.transcriptWriter.write(message);
        } else {
            console.log(message, { flush: true });
        }

        // 仅写入转录文件：添加输入详情 / Transcript file only: add input details
        if (this.transcriptWriter && toolInput) {
            const detail = this._formatToolInput(toolInput);
            if (detail) {
                this.transcriptWriter.writeToFile(`    Input: ${detail}\n`);
            }
        }
    }

    /**
     * 格式化工具输入以便人类可读地记录 / Format tool input for human-readable logging
     *
     * @param toolInput - 工具输入参数
     * @param maxLength - 最大长度限制 / Maximum length limit
     */
    private _formatToolInput(toolInput: Record<string, unknown>, maxLength: number = 100): string {
        if (!toolInput) {
            return "";
        }

        // WebSearch: 显示查询 / Show query
        if ("query" in toolInput) {
            const query = String(toolInput["query"]);
            const display = query.length <= maxLength ? query : query.slice(0, maxLength) + "...";
            return `query='${display}'`;
        }

        // Write: 显示文件路径和内容大小 / Show file path and content size
        if ("file_path" in toolInput && "content" in toolInput) {
            const filename = basename(String(toolInput.file_path));
            const contentLength = String(toolInput.content).length;
            return `file='${filename}' (${contentLength} chars)`;
        }

        // Read/Glob: 显示路径或模式 / Show path or pattern
        if ("file_path" in toolInput) {
            return `path='${toolInput["file_path"]}'`;
        }

        if ("pattern" in toolInput) {
            return `pattern='${toolInput["pattern"]}'`;
        }

        // Task: 显示 subagent spawn / Show subagent spawn
        if ("subagent_type" in toolInput) {
            return `spawn=${toolInput["subagent_type"] || ""} (${toolInput["description"] || ""})`;
        }

        // Fallback: 通用（截断）/ Generic (truncated)
        const str = JSON.stringify(toolInput);
        return str.length <= maxLength ? str : str.slice(0, maxLength) + "...";
    }

    /**
     * 将结构化日志条目写入 JSONL 文件 / Write structured log entry to JSONL file
     *
     * @param logEntry - 日志条目 / Log entry
     */
    private _logToJsonl(logEntry: JsonlLogEntry): void {
        if (this.toolLogFile) {
            this.toolLogFile.write(JSON.stringify(logEntry) + "\n");
        }
    }

    /**
     * PreToolUse 事件的 Hook 回调 - 捕获工具调用
     * Hook callback for PreToolUse events - captures tool calls
     *
     * @param hookInput - Hook 输入参数
     * @param toolUseId - 工具使用的唯一 ID
     * @param _context - Hook 上下文（未使用）
     */
    async preToolUseHook(
        hookInput: HookInput,
        toolUseId: string,
        _context: HookContext
    ): Promise<{ continue: boolean }> {
        const toolName = hookInput.tool_name as string;
        const toolInput = (hookInput.tool_input || {}) as Record<string, unknown>;
        // const toolUseId = hookInput.tool_use_id || "";
        const timestamp = new Date().toISOString();

        // 确定 agent 上下文 / Determine agent context
        const isSubagent = this._currentParentId && this.sessions.has(this._currentParentId);

        if (isSubagent && this._currentParentId) {
            const session = this.sessions.get(this._currentParentId)!;
            const agentId = session.subagentId;
            const agentType = session.subagentType;

            // 为 subagent 创建并存储记录 / Create and store record for subagent
            const record: ToolCallRecord = {
                timestamp,
                toolName,
                toolInput: toolInput || {},
                toolUseId,
                subagentType: agentType,
                parentToolUseId: this._currentParentId,
            };
            session.toolCalls.push(record);
            this.toolCallRecords.set(toolUseId, record);

            // 记录日志 / Log
            this._logToolUse(agentId, toolName, toolInput);
            this._logToJsonl({
                event: "tool_call_start",
                timestamp,
                tool_use_id: toolUseId,
                agent_id: agentId,
                agent_type: agentType,
                tool_name: toolName,
                tool_input: toolInput,
                parent_tool_use_id: this._currentParentId,
            });
        }
        else if (toolName !== "Task") {
            // 跳过 main agent 的 Task 调用（由 spawn message 处理）/ Skip Task calls for main agent (handled by spawn message)
            this._logToolUse("MAIN AGENT", toolName, toolInput);
            this._logToJsonl({
                event: "tool_call_start",
                timestamp,
                tool_use_id: toolUseId,
                agent_id: "MAIN_AGENT",
                agent_type: "lead",
                tool_name: toolName,
                tool_input: toolInput,
            });
        }

        return { continue: true };
    }

    /**
     * PostToolUse 事件的 Hook 回调 - 捕获工具结果
     * Hook callback for PostToolUse events - captures tool results
     *
     * @param hookInput - Hook 输入参数
     * @param toolUseId - 工具使用的唯一 ID
     * @param _context - Hook 上下文（未使用）
     */
    async postToolUseHook(
        hookInput: HookInput,
        toolUseId: string,
        _context: HookContext
    ): Promise<{ continue: boolean }> {
        const toolResponse = hookInput.tool_response;
        const record = this.toolCallRecords.get(toolUseId);

        if (!record) {
            return { continue: true };
        }

        // 用输出更新记录 / Update record with output
        record.toolOutput = toolResponse;

        // 检查错误 / Check for errors
        let error: string | undefined;
        if (typeof toolResponse === "object" && toolResponse !== null && "error" in toolResponse) {
            error = toolResponse.error as string;
        }

        if (error) {
            record.error = error;
            const session = this.sessions.get(record.parentToolUseId || "");
            if (session) {
                console.warn(`[${session.subagentId}] Tool ${record.toolName} error: ${error}`);
            }
        }

        // 获取 agent 信息用于日志 / Get agent info for logging
        const session = this.sessions.get(record.parentToolUseId || "");
        const agentId = session?.subagentId || "MAIN_AGENT";
        const agentType = session?.subagentType || "lead";

        // 记录完成到 JSONL / Log completion to JSONL
        this._logToJsonl({
            event: "tool_call_complete",
            timestamp: new Date().toISOString(),
            tool_use_id: toolUseId,
            agent_id: agentId,
            agent_type: agentType,
            tool_name: record.toolName,
            success: error === undefined,
            error,
            output_size: toolResponse ? String(toolResponse).length : 0,
        });

        return { continue: true };
    }

    /**
     * 关闭工具日志文件 / Close the tool log file
     */
    close(): void {
        if (this.toolLogFile) {
            this.toolLogFile.end();
            this.toolLogFile = undefined;
        }
    }
}
