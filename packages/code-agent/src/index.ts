import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error('Error: ANTHROPIC_API_KEY is not set in .env file');
  process.exit(1);
}

const client = new Anthropic({ apiKey });

const SYSTEM_PROMPT = `你是一个专业的代码助手。你的任务是帮助用户：
1. 解释代码的功能和逻辑
2. 提供代码改进建议
3. 修复代码中的 bug
4. 编写新的代码片段

请用清晰、简洁的语言回答，并在必要时提供代码示例。`;

async function main() {
  const args = process.argv.slice(2);
  const userInput = args.join(' ');

  if (!userInput) {
    console.log('用法: pnpm dev "<你的代码问题或代码片段>"');
    process.exit(0);
  }

  console.log('\n正在思考...\n');

  try {
    const message = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userInput }],
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
