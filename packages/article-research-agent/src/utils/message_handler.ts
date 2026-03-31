/**
 * 处理 assistant 消息并写入 transcript。
 */

import type { SDKAssistantMessage } from "@anthropic-ai/claude-agent-sdk";
import type { TranscriptWriter } from "./transcript";
import type { SubagentTracker } from "./subagent_tracker";
import chalk from "chalk";



export function processAssistantMessage(
    message: SDKAssistantMessage,
    tracker: SubagentTracker,
    transcript: TranscriptWriter
): void {

    // 使用消息中的 parent_tool_use_id 更新 tracker 上下文
    const parentId = message.parent_tool_use_id;
    tracker.setCurrentContext(parentId ?? undefined);

    console.log(chalk.dim(`[DEBUG] Processing assistant message: ${JSON.stringify(message)}`));
    for (const block of message.message?.content || []) {
        // 打印思考状态
        if (block.type === 'thinking') {
            process.stdout.write(chalk.red('Thinking: '));
            process.stdout.write(chalk.gray(block.thinking));
            process.stdout.write(chalk.greenBright('\r\n'));
        }

        if (block.type === "text" && block.text) {
            // 打印标识
            process.stdout.write(chalk.greenBright('\r\nAssistant text: '));
            // 写入文本到转录文件和控制台
            transcript.write(chalk.yellow(block.text), "");
            process.stdout.write(chalk.greenBright('\r\n'));
        }
        else if (block.type === "tool_use" && block.name === "Task") {
            console.log(chalk.dim(`[DEBUG] Detected Task tool use block: ${JSON.stringify(block)}`));
            // 仅处理 Task 工具（subagent 生成）
            const input = (block.input || {}) as Record<string, string>;
            const subagentType = String(input.subagent_type || "unknown");
            const description = String(input.description || "no description");
            const prompt = String(input.prompt || "");

            // 向 tracker 注册并获取 subagent ID
            const subagentId = tracker.registerSubagentSpawn(
                block.id || "",
                subagentType,
                description,
                prompt
            );

            // 面向用户的输出，包含 subagent ID
            transcript.write(chalk.yellow(`\n\n[🚀 Spawning ${subagentId}: ${description}]\n`), "");
        }
    }
}
