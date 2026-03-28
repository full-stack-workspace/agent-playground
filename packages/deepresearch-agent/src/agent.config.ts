/**
 * @file Subagent 相关配置文件 
 * 
 * @description 配置文件中定义了 Subagent 相关的参数，如模型、工具、允许的工具等。
 */

import type { AgentDefinition } from '@anthropic-ai/claude-agent-sdk';
import { researcherPrompt, } from './prompts/researcher';
import { reportWriterPrompt } from './prompts/report_writer';
import { dataAnalystPrompt } from './prompts/data_analyst';

import type { SubagentTracker } from './utils/subagent_tracker';
import { protectEnvFilesHook } from './hooks/protect-env-files';

const researcherDescription = `Use this agent when you need to gather research information on any topic. The researcher uses web search to find relevant information, articles, and sources from across the internet. Writes research findings to files/research_notes/ for later use by report writers. Ideal for complex research tasks that require deep searching and cross-referencing.`;
const dataAnalystDescription = `Use this agent AFTER researchers have completed their work to generate quantitative analysis and visualizations. The data-analyst reads research notes from files/research_notes/, extracts numerical data (percentages, rankings, trends, comparisons), and generates charts using Python/matplotlib via Bash. Saves charts to files/charts/ and writes a data summary to files/data/. Use this before the report-writer to add visual insights.`;
const reportWriterDescription = `Use this agent when you need to create a formal research report document. The report-writer reads research findings from files/research_notes/, data analysis from files/data/, and charts from files/charts/, then synthesizes them into clear, concise, professionally formatted PDF reports in files/reports/ using reportlab. Ideal for creating structured documents with proper citations, data, and embedded visuals. Does NOT conduct web searches - only reads existing research notes and creates PDF reports.`;



// researcher 子智能体配置
const researcherAgentConfig: AgentDefinition = {
    prompt: researcherPrompt,
    // 告诉 Lead Agent 什么时候应该调用这个 subagent
    description: researcherDescription,
    model: 'haiku',
    // 允许的工具
    // WebSearch: 用于搜索互联网上的信息
    // Write: 用于将信息写入文件
    tools: ['WebSearch', 'Write'],
};

const dataAnalystAgentConfig: AgentDefinition = {
    prompt: dataAnalystPrompt,
    // 告诉 Lead Agent 什么时候应该调用这个 subagent
    description: dataAnalystDescription,
    model: 'haiku',
    // 数据分析过程中允许的工具
    // ==== 只读分析
    // Read: 用于读取文件内容
    // Glob: 用于匹配文件路径
    // Grep: 用于在文件中搜索文本
    // ==== 执行命令 && 写入、修改文件
    // Bash: 用于执行 Bash 命令
    // Write: 用于将信息写入文件
    // Edit: 用于编辑文件内容
    tools: ['Glob', 'Read', 'Grep', 'Bash', 'Write', 'Edit'],
};

// report writer 子智能体配置
const reportWriterAgentConfig: AgentDefinition = {
    prompt: reportWriterPrompt,
    // 告诉 Lead Agent 什么时候应该调用这个 subagent
    description: reportWriterDescription,
    model: 'haiku',
    // ==== 执行命令 && 写入、修改文件
    // Skill: 用于执行技能操作
    // Write: 用于将信息写入文件
    // Glob: 用于匹配文件路径
    // Read: 用于读取文件内容
    // Bash: 用于执行 Bash 命令
    tools: ['Skill', 'Write', 'Glob', 'Read', 'Bash'],
};

export const subagentConfigs = {
    'researcher': researcherAgentConfig,
    'data-analyst': dataAnalystAgentConfig,
    'report-writer': reportWriterAgentConfig,
};


/**
 * 获取 Subagent 相关的钩子函数。
 * 
 * @param tracker Subagent tracker 实例
 * @returns Subagent 相关的钩子函数
 */
export function getHooks(tracker: SubagentTracker) {
    const agentHooks = {
        // 钩子由两部分组成：
        // 1、回调函数：钩子触发时运行的逻辑
        // 2、钩子配置：告诉 SDK 要挂接到哪个事件（如 PreToolUse）以及要匹配哪些工具
        PreToolUse: [
            {
                // 匹配 Write 或 Edit 工具
                // 用于保护环境变量文件
                // 例如：.env 文件
                matcher: ['Write|Edit'],
                hooks: [protectEnvFilesHook],
            },
            {
                matcher: undefined,
                hooks: [tracker.preToolUseHook],
            }
        ],
        PostToolUse: [
            {
                matcher: undefined,
                hooks: [tracker.postToolUseHook],
            }
        ],
    };

    return agentHooks;
}
