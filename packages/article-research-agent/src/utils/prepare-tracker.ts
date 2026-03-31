/**
 * @file 准备 Subagent tracker
 * 
 * @description 准备 Subagent tracker，包括创建输出目录和初始化 tracker。
 */
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import { setupSession, TranscriptWriter } from './transcript';
import { SubagentTracker } from './subagent_tracker';

/**
 * 准备 Subagent tracker，包括创建输出目录和初始化 tracker。
 * 
 * @returns Subagent tracker 实例
 */
export function prepareWriterAndTracker() {
    // 当前 agent 的基础目录
    // const BASE_DIR = path.dirname(new URL(import.meta.url).pathname);
    const BASE_DIR = process.cwd();
    console.log(chalk.dim(`BASE_DIR: ${BASE_DIR}`));
    const { transcriptFile, sessionDir } = setupSession(BASE_DIR);
    // 创建 transcript 写入器
    const transcriptWriter = new TranscriptWriter(transcriptFile);

    // 确保输出目录存在
    const researchNotesDir = path.join(BASE_DIR, "output", "research_notes");
    const reportsDir = path.join(BASE_DIR, "output", "reports");
    fs.mkdirSync(researchNotesDir, { recursive: true });
    fs.mkdirSync(reportsDir, { recursive: true });

    // 使用 transcript 写入器和会话目录初始化 subagent tracker
    const tracker = new SubagentTracker(transcriptWriter, sessionDir);
    return {
        transcriptWriter,
        tracker,
        sessionDir,
        transcriptFile,
    };
}

