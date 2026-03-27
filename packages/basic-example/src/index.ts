import chalk from 'chalk';
// 将 .env 文件中的内容加载到环境变量中
import 'dotenv/config';

import { queryExample, sessionQueryExample } from './query-example';
import { tuiChat } from './tui-chat/index';
import { basicExampleMcpServer } from './mcps/basic-example-mcp-server';

async function main() {
    console.log(chalk.green('Starting basic example...\n'));
    if (!process.env.ANTHROPIC_API_KEY) {
        console.error('Error: ANTHROPIC_API_KEY is not set. If you use a .env file, ensure it exists and is loaded (dotenv).');
        process.exit(1);
    }

    // 简单的查询示例1：不 care 会话状态管理
    // await queryExample();
    // 简单的查询示例2：care 会话状态管理
    // await sessionQueryExample();


    // 基础使用例1：使用 TUI 实现多轮聊天对话，没有传入 tools
    // await tuiChat({
    //     tuiPrompt: 'User:',
    // });

    // 基础使用例2：使用 TUI 实现多轮聊天对话，传入内置 tools
    await tuiChat({
        tuiPrompt: 'User: ',
        allowedTools: ['WebSearch', 'WebFetch'],
        // 启用流式输出
        includePartialMessages: true,
    });

    // 使用 TUI 实现多轮聊天对话，传入了数据计算工具调用能力
    // await tuiChat({
    //     tuiPrompt: 'User: ',
    //     mcpServers: {
    //         utilities: basicExampleMcpServer,
    //     },
    //     // 必须在 allowedTools 里指定的工具才能使用
    //     // 工具的命名格式是固定的：mcp__{server_name}__{tool_name}
    //     // 这里就是 mcp__utilities__math_calculator
    //     allowedTools: ['WebSearch', 'WebFetch', 'mcp__utilities__math_calculator'],
    //     // 启用流式输出
    //     includePartialMessages: false,
    // });

}

main().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
});
