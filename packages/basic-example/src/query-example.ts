import {query, Query} from '@anthropic-ai/claude-agent-sdk';
import chalk from 'chalk';

export async function queryExample() {
    const result: Query = query({
        prompt: '你好，你是谁？',
    })

    for await (const message of result) {
        // console.log('返回 message:', message);
        // message type 主要包括: user, assistant, tool_use, tool_result, error, stop, tool_use_end, tool_use_start
        const type = message.type;
        switch (type) {
            // 返回 assistant 消息时，需要遍历 message.message.content 获取文本内容
            case 'assistant': {
                for (const msg of message.message.content) {
                    if (msg.type === 'text') {
                        console.log(chalk.blue('返回 Assistant text: ', msg.text));
                    }
                }
            }
        }
    }
}

/**
 * 会话示例
 * Claude Agent SDK 自带会话管理功能，当新建一个 query 时，会返回一个 session ID
 * 开发者可以使用这个 ID 来保存和恢复会话
 */
export async function sessionQueryExample() {
    let sessionId: string | undefined;
    const result: Query = query({
        prompt: '你好，你是谁？',
        options: {
            // 如果 sessionId 不为空，则恢复会话
            resume: sessionId
        }
    });

    for await (const message of result) {
        switch (message.type) {
            // 返回一个 session_id，需要把这个 session_id 存下来
            case 'system': {
                if (message.subtype === 'init') {
                    sessionId = message.session_id;
                    console.log(chalk.bgBlue('当前会话 ID:', sessionId));
                }
                break;
            }
            case 'assistant': {
                for (const msg of message.message.content) {
                    if (msg.type === 'text') {
                        console.log(chalk.yellow('返回 Assistant text: ', msg.text));
                    }
                }
            }
        }
    }
}
