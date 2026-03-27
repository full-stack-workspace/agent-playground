import { createSdkMcpServer } from '@anthropic-ai/claude-agent-sdk';
import { mathCalcTool } from '../tools/math-calc-tool';

export const basicExampleMcpServer = createSdkMcpServer({
    name: 'utilities',
    tools: [mathCalcTool],
});

