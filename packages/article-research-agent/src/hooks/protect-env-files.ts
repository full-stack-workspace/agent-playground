/**
 * @file 定义保护环境变量的钩子
 */

import { PreToolUseHookInput } from '@anthropic-ai/claude-agent-sdk';

export const protectEnvFilesHook = async (
    preInput: PreToolUseHookInput,
    toolUseID: string,
    hookContext: { signal?: AbortSignal }
) => {
    const toolInput = preInput.tool_input as { file_path?: string } | undefined;
    const filePath = toolInput?.file_path;
    const fileName = filePath?.split('/')?.pop();

    // 如果目标是 .env 文件则阻止操作
    if (fileName === '.env') {
        return {
            hookSpecificOutput: {
                hookEventName: preInput.hook_event_name,
                permissionDecision: 'deny',
                permissionDecisionReason: 'Cannot modify .env files'
            }
        };
    }

    // 返回空对象以允许操作
    return {};
}
