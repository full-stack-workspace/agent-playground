/**
 * 数学计算工具封装
 */

import { tool } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';
import { mathCalculator } from '../utils/math';

export const mathCalcTool = tool(
    // 工具名称
    'math_calculator',
    // 工具描述
    'Perform a calculation using an expression string. The strings used here are executed using mathjs evaluate function. eg  "6 * (3.5 + 4.5)"',
    {
        expression: z.string().describe('The expression to be evaluated'),
    },
    // 工具处理函数
    async (args) => {
        const result = mathCalculator(args.expression);
        return {
            content: [{
                type: 'text',
                text: result,
            }]
        };
    },
);
