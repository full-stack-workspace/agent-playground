/**
 * @file 使用 TUI 实现多轮聊天对话
 */

import readline from 'node:readline';
import { stdin as input, stdout as output } from 'node:process';
import { createInterface } from 'readline';
import chalk from 'chalk';
import { chatExample } from './chat-example';

import type { Options } from '@anthropic-ai/claude-agent-sdk';

interface TuiChatOptions extends Options {
    tuiPrompt?: string;
}

export async function tuiChat(options: TuiChatOptions = {}) {
    let sessionId: string | undefined;

    const {tuiPrompt, ...queryOptions} = options;

    const rl = createInterface({
        input,
        output,
        prompt: tuiPrompt || 'User:'
    });

    rl.prompt();

    rl.on('line', async (input: string) => {
        const userInput = input.trim();
        if (userInput === 'exit') {
            rl.close();
            return;
        }

        // Move off the prompt line and pause readline so its redraw logic doesn't
        // clear/overwrite streaming output written to stdout.
        rl.pause();
        output.write('\n');

        sessionId = await chatExample(userInput, {
            sessionId,
            ...queryOptions
        });

        rl.resume();
        rl.prompt();
    });

    rl.on('close', () => {
        console.log(chalk.green('Goodbye, TUI Chat is closed!\n'));
        process.exit(0);
    });
}