import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error('Error: ANTHROPIC_API_KEY is not set in .env file');
  process.exit(1);
}

const client = new Anthropic({ apiKey });

const SYSTEM_PROMPT = `你是一个专业的研究助手。你的任务是帮助用户：
1. 分析研究主题，提供结构化的研究思路
2. 建议研究方向和参考资料
3. 帮助整理研究笔记和思路
4. 提供多角度的思考建议

请用清晰、有条理的方式回答，使用列表或分点来组织内容。`;

async function main() {
  const args = process.argv.slice(2);
  const userInput = args.join(' ');

  if (!userInput) {
    console.log('用法: pnpm dev "<你的研究主题或问题>"');
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
