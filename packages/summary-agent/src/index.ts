import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error('Error: ANTHROPIC_API_KEY is not set in .env file');
  process.exit(1);
}

const client = new Anthropic({ apiKey });

const SYSTEM_PROMPT = `你是一个专业的文本摘要助手。你的任务是：
1. 阅读用户提供的文本
2. 提取关键要点
3. 生成简洁、准确的摘要
4. 使用要点列表形式呈现

请确保摘要涵盖原文的主要内容，避免遗漏重要信息。`;

async function readInput(input: string): Promise<string> {
  try {
    const stats = await fs.stat(input);
    if (stats.isFile()) {
      return await fs.readFile(input, 'utf-8');
    }
  } catch {
    // 不是文件路径，直接返回输入文本
  }
  return input;
}

async function main() {
  const args = process.argv.slice(2);
  const userInput = args.join(' ');

  if (!userInput) {
    console.log('用法: pnpm dev "<文本内容或文件路径>"');
    process.exit(0);
  }

  console.log('\n正在处理...\n');

  try {
    const text = await readInput(userInput);

    const message = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `请总结以下文本：\n\n${text}` }],
    });

    const response = message.content[0];
    if (response.type === 'text') {
      console.log(response.text);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
