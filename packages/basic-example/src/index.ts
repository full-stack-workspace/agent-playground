import chalk from 'chalk';
// 将 .env 文件中的内容加载到环境变量中
import 'dotenv/config';

import { queryExample, sessionQueryExample } from './query-example';
import { tuiChat } from './tui-chat/index';

async function main() {
    console.log(chalk.green('Starting basic example...\n'));
    if (!process.env.ANTHROPIC_API_KEY) {
        console.error('Error: ANTHROPIC_API_KEY is not set. If you use a .env file, ensure it exists and is loaded (dotenv).');
        process.exit(1);
    }

    // await queryExample();
    // await sessionQueryExample();

    // 使用 TUI 实现多轮聊天对话，没有传入 tools
    // await tuiChat({
    //     tuiPrompt: 'User:',
    // });
    // 使用 TUI 实现多轮聊天对话，传入 tools
    await tuiChat({
        tuiPrompt: 'User: ',
        allowedTools: ['WebSearch', 'WebFetch'],
        // 启用流式输出
        includePartialMessages: true,
    });

}

main().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
});
