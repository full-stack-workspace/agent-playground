import { query, Query, Options } from "@anthropic-ai/claude-agent-sdk";
import chalk from 'chalk';

export async function chatExample(userInput: string, options: Options = {}) {
    let _sessionId: string | undefined;
    let printedThinking = false;
    let printedAssistantText = false;
    const debugStream = false;
    const stallCursor = chalk.gray('▍');
    const stallAfterMs = 500;
    const stallTickMs = 120;
    let stallCursorVisible = false;
    let lastActivityAt = Date.now();
    let currentSection: 'thinking' | 'text' | null = null;

    const includePartialMessages = options?.includePartialMessages ?? false;
    const allowedTools = options?.allowedTools ?? [];

    const systemPrompt = allowedTools.length > 0
        ? `You are a helpful assistant that can use tools to get information. You can use the following tools: ${allowedTools?.join(', ')}`
        : 'You are a helpful assistant that can help users with their questions.';

    console.log(chalk.bgGray.gray(`chatExample systemPrompt: ${systemPrompt}`));

    const result: Query = query({
        prompt: userInput,
        options: {
            systemPrompt: systemPrompt,
            resume: options?.sessionId,
            mcpServers: options?.mcpServers,
            allowedTools: options?.allowedTools,
            includePartialMessages: includePartialMessages,
        }
    });

    const maybeClearStallCursor = () => {
        if (!stallCursorVisible) return;
        // Erase the last printed cursor char (best-effort).
        process.stdout.write('\b \b');
        stallCursorVisible = false;
    };

    const stallTimer = setInterval(() => {
        const idleMs = Date.now() - lastActivityAt;
        if (idleMs < stallAfterMs) return;
        if (stallCursorVisible) return;
        // Only show the stall cursor after we've started printing something.
        if (!printedThinking && !printedAssistantText) return;
        process.stdout.write(stallCursor);
        stallCursorVisible = true;
    }, stallTickMs);

    try {
        const startSection = (section: 'thinking' | 'text') => {
            if (currentSection === section) return;
            maybeClearStallCursor();
            // If we've printed anything before, start the next section on a new line.
            if (printedThinking || printedAssistantText) process.stdout.write('\n');
            currentSection = section;
            if (section === 'thinking') {
                process.stdout.write(chalk.red('Thinking: '));
                printedThinking = true;
            } else {
                process.stdout.write(chalk.greenBright('Assistant text: '));
                printedAssistantText = true;
            }
        };

        for await (const message of result) {
            const type = message.type;

            switch (type) {
                // system message
                case 'system': {
                    // 获取会话 ID
                    if (message.subtype === 'init') {
                        _sessionId = message.session_id;
                    }
                    break;
                }
                // 接收到流式数据
                case 'stream_event': {
                    const event = message.event;
                    if (debugStream) {
                        // Useful to inspect event shapes when tweaking formatting.
                        // console.log(chalk.gray('stream_event:'), JSON.stringify(event, null, 2));
                    }

                    // Prefer using block boundaries to support multiple Thinking/Text segments:
                    // Thinking -> Text -> Thinking -> Text ...
                    if (event.type === 'content_block_start') {
                        const blockType = (event as any).content_block?.type;
                        if (blockType === 'thinking') startSection('thinking');
                        if (blockType === 'text') startSection('text');
                        break;
                    }

                    if (event.type === "content_block_delta") {
                        switch (event.delta.type) {
                            case "thinking_delta": {
                                const thinkingText = event.delta.thinking;
                                maybeClearStallCursor();
                                lastActivityAt = Date.now();
                                startSection('thinking');
                                process.stdout.write(chalk.gray(thinkingText));
                                break;
                            }
                            case "text_delta": {
                                const text = event.delta.text;
                                if (debugStream) {
                                    console.log(chalk.red('event:'), JSON.stringify(event, null, 2));
                                    console.log(chalk.red('text:'), text);
                                }
                                maybeClearStallCursor();
                                lastActivityAt = Date.now();
                                startSection('text');
                                process.stdout.write(chalk.yellow(text));
                                break;
                            }
                        }
                    }
                    break;
                }
                case 'assistant': {
                    // 过滤掉 partial messages
                    if (includePartialMessages) {
                        // When streaming is enabled, ignore aggregated assistant messages
                        // but keep consuming the stream events.
                        break;
                    }

                    console.log(chalk.red('assistant message:'), JSON.stringify(message));

                    for (const block of message.message?.content) {
                        if (block.type === 'thinking') {
                            process.stdout.write(chalk.red('Thinking: '));
                            process.stdout.write(chalk.gray(block.thinking));
                            process.stdout.write(chalk.greenBright('\r\n'));

                        }
                        if (block.type === 'text') {
                            process.stdout.write(chalk.greenBright('\r\nAssistant text: '));
                            process.stdout.write(chalk.yellow(block.text));
                            process.stdout.write(chalk.greenBright('\r\n'));
                        }
                        if (block.type === 'tool_use') {
                            process.stdout.write(chalk.yellow(`Using tool: ${block.name} \r\n`));
                            if (block.input) {
                                // @ts-ignore
                                process.stdout.write(chalk.red(` - Input: ${block?.input?.expression || 'none'} \r\n`));
                            }
                        }
                    }
                    break;
                }
                case 'result': {
                    // console.log(
                    //     chalk.red('result message:'),
                    //     chalk.blue(message.type),
                    //     chalk.bgCyan(JSON.stringify(message, null, 2)),
                    // );
                    break;
                }
            }
        }
    } finally {
        clearInterval(stallTimer);
        // If we left a stall cursor visible, erase it before finishing.
        maybeClearStallCursor();
    }

    // Ensure the next readline prompt starts on a fresh line.
    if (printedThinking || printedAssistantText) {
        process.stdout.write('\n');
    }

    return _sessionId;
}
