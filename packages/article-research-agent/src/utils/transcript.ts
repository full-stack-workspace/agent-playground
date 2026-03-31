import * as fs from "fs";
import { join } from "path";
import { createWriteStream, WriteStream } from "fs";
import chalk from "chalk";

export interface SessionPaths {
    transcriptFile: string;
    sessionDir: string;
}

/**
 * 创建会话目录和转录文件，用于记录会话中的所有工具调用和会话日志。
 *  在 logs/ 目录下创建一个以时间戳命名的会话文件夹，包含转录文件和详细工具调用日志。
 *
 * @param baseDir 会话目录的基础路径，默认 logs/
 * @returns SessionPaths 转录文件路径和会话目录路径
 */
export function setupSession(baseDir: string): SessionPaths {

    // Create session directory
    const timestamp = new Date()
        .toISOString()
        .replace(/[-:]/g, "")
        .replace("T", "_")
        .slice(0, 15);
    // 创建会话目录
    // logs/
    //   session session_20230824_153000/
    //     transcript.txt
    //     tool_calls.jsonl
    const sessionDir = join(baseDir, "logs", `session_${timestamp}`);
    console.log(chalk.dim(`SessionDir: ${sessionDir}`));
    fs.mkdirSync(sessionDir, { recursive: true });

    // Transcript file in session directory
    const transcriptFile = join(sessionDir, "transcript.txt");

    return { transcriptFile, sessionDir };
}

/**
 *
 * 提供写入文本到控制台和转录文件的方法，以及关闭转录文件的方法。
 */
export class TranscriptWriter {
    private file: WriteStream;

    constructor(transcriptFile: string) {
        this.file = createWriteStream(transcriptFile, { encoding: "utf-8" });
    }

    /**
     * 写入文本到控制台和转录文件。
     *
     * @param text 要写入的文本
     * @param end 行结束符，默认换行符
     * @param flush 是否强制刷新文件流
     */
    write(text: string, end: string = "", flush: boolean = true): void {
        process.stdout.write(text + end);
        this.file.write(text + end);
        if (flush) {
            // this.file.flush();
            // Node.js 流会自动刷新，但我们可以强制刷新
        }
    }

    /**
     * 写入文本到转录文件，但不写入控制台。
     * Write text to transcript file only (not console).
     *
     * @param text 要写入的文本
     * @param flush 是否强制刷新文件流
     */
    writeToFile(text: string, flush: boolean = true): void {
        this.file.write(text);
    }

    /**
     * 关闭转录文件流，确保所有数据写入文件。
     */
    close(): void {
        /** Close the transcript file. */
        this.file.end();
    }
}
