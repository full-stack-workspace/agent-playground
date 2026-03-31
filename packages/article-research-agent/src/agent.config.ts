/**
 * @file subagent 相关配置
 */

import type { AgentDefinition } from '@anthropic-ai/claude-agent-sdk';

import { articleResearcherPrompt } from './prompts/article-researcher';
import { articleSummarizerPrompt } from './prompts/article-summarizer';
import { articleScorerPrompt } from './prompts/article-scorer';
import type { SubagentTracker } from './utils/subagent_tracker';
import { protectEnvFilesHook } from './hooks/protect-env-files';

const articleResearcherDescription = `Use this agent when you need to deeply analyze a specific article from a SINGLE, predefined analytical angle. The article-researcher reads the provided article content and extracts highly specific, data-driven highlights and keyword tags strictly tailored to its assigned angle. Writes structured Markdown research notes to the output/research_notes/ directory. Ideal for parallel execution to break down complex articles into multi-dimensional insights. Does NOT summarize the entire article or use external search.`;

const articleSummarizerDescription = `Use this agent AFTER all parallel article-researchers have completed their angle-specific notes for a single article. The article-summarizer uses Glob and Read tools to pull all research notes for a specific article ID from output/research_notes/. It deduplicates tags, merges overlapping concepts, and synthesizes a high-density master summary while strictly preserving quantitative metrics and core quotes. Writes the consolidated master report to output/summaries/. Ideal for reducing multi-perspective data into a cohesive narrative.`;

const articleScorerDescription = `Use this agent as the FINAL step AFTER the article-summarizer has generated the master summary. The article-scorer uses Glob and Read to ingest the master summary from output/summaries/. It critically evaluates the synthesized content across specific dimensions (depth, novelty, practicality) using a 10-point scale, and may use the Skill tool for dynamic scoring rules. It then assembles the final, publication-ready Markdown report—integrating scores, the master summary, and tags—and writes it to output/final_reports/.`;


// article-researcher agent 配置
const articleResearcherAgent: AgentDefinition = {
    prompt: articleResearcherPrompt,
    description: articleResearcherDescription,
    model: 'haiku',
    tools: ['Write'],
};

export const articleSummarizerAgent: AgentDefinition = {
    prompt: articleSummarizerPrompt,
    description: articleSummarizerDescription,
    model: 'haiku',
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

export const articleScorerAgent: AgentDefinition = {
    prompt: articleScorerPrompt,
    description: articleScorerDescription,
    model: 'haiku',
    // ==== 执行命令 && 写入、修改文件
    // Skill: 用于执行技能操作
    // Write: 用于将信息写入文件
    // Glob: 用于匹配文件路径
    // Read: 用于读取文件内容
    // Bash: 用于执行 Bash 命令
    tools: ['Skill', 'Write', 'Glob', 'Read', 'Bash'],
};

export const subagentConfig = {
    'article-researcher': articleResearcherAgent,
    'article-summarizer': articleSummarizerAgent,
    'article-scorer': articleScorerAgent,
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
