/**
 * @file 主文件入口
 */

import * as readline from "node:readline";
import * as path from "node:path";
import { query, type Query, type SDKAssistantMessage } from "@anthropic-ai/claude-agent-sdk";
import chalk from 'chalk';

import { getHooks, subagentConfigs } from "./agent.config";
import { prepareWriterAndTracker } from "./utils/prepare-tracker";
import { processAssistantMessage } from "./utils/message_handler";
import { leadAgentPrompt } from "./prompts/lead_agent";

// 将 .env 文件中的内容加载到环境变量中
import 'dotenv/config';

export async function chat(): Promise<void> {
    // 检查是否设置了 API 密钥
    if (!process.env.ANTHROPIC_API_KEY) {
        console.error('Error: ANTHROPIC_API_KEY is not set. If you use a .env file, ensure it exists and is loaded (dotenv).');
        process.exit(1);
    }

    const { transcriptWriter, tracker, sessionDir, transcriptFile } = prepareWriterAndTracker();

    console.log(chalk.bold.cyan("\n=== DeepResearch Agent ==="));
    console.log(
        chalk.cyan("Ask me to research any topic, gather information, or analyze documents.")
    );
    console.log(
        chalk.cyan("I can delegate complex tasks to specialized researcher, analyst, and report-writer agents.")
    );
    console.log(chalk.cyan(`\nRegistered Subagents: ${Object.keys(subagentConfigs).join(", ")}`));
    console.log(chalk.cyan(`Session logs: ${sessionDir}`));
    console.log(chalk.red("Type 'exit' or 'quit' to end.\n"));

    // 创建 readline 接口
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const askQuestion = (): Promise<string> => {
        return new Promise((resolve) => {
            rl.question(chalk.green("\nYou: "), (answer) => {
                resolve(answer.trim());
            });
        });
    };

    // 用于会话连续性的 Session ID
    let sessionId: string | undefined;

    try {
        while (true) {
            // 获取用户输入
            let userInput: string;
            try {
                userInput = await askQuestion();
            }
            catch (error) {
                break;
            }

            if (!userInput || ["exit", "quit", "q"].includes(userInput.toLowerCase())) {
                break;
            }
            // 将用户输入写入 transcript（仅写入文件，不输出到控制台）
            transcriptWriter.writeToFile(`\nYou: ${userInput}\n`);

            const result: Query = query({
                prompt: userInput,
                options: {
                    // 会话 id
                    resume: sessionId,
                    // lead agent 系统提示词
                    systemPrompt: leadAgentPrompt,
                    // 绕过所有权限检查	所有工具无需权限提示即可运行
                    permissionMode: "bypassPermissions",
                    // 允许使用的工具，主 Agent 仅使用 Task 工具来调用其他子 Agent
                    allowedTools: ["Task"],
                    // 注册的子 Agent 配置
                    // 主 Agent 仅调用 Task 工具来委托任务给其他子 Agent
                    agents: subagentConfigs,
                    // 用于追踪的 hooks
                    hooks: getHooks(tracker) as any,
                    // 模型
                    model: "haiku",
                },
            });
            transcriptWriter.write("\nAgent: ");
            // 流式处理响应
            for await (const message of result) {
                const type = message.type;

                console.log(chalk.dim(`[DEBUG] Received message in query result: ${JSON.stringify(message)}`));

                switch (type) {
                    case 'system': {
                        if (message.subtype === 'init') {
                            sessionId = message.session_id;
                            break;
                        }
                    }
                    case 'assistant': {
                        processAssistantMessage(
                            message as SDKAssistantMessage,
                            tracker,
                            transcriptWriter,
                        )
                        break;
                    }
                }
            }

            transcriptWriter.write("\n", "");
        }
    }
    catch (error) {
        console.error("Chat error:", error);
    }
    finally {
        transcriptWriter.write("\n\nGoodbye!\n", "");
        transcriptWriter.close();
        tracker.close();
        rl.close();
        console.log(chalk.dim(`\nSession logs saved to: ${sessionDir}`));
        console.log(chalk.dim(`  - Transcript: ${transcriptFile}`));
        console.log(chalk.dim(`  - Tool calls: ${path.join(sessionDir, "tool_calls.jsonl")}`));
    }

}

chat().catch(error => {
    console.error("Chat error:", error);
});
