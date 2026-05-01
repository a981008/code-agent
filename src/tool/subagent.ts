import { Tool } from './types';
import { Console } from '../console';
import { Agent } from '../agent';

const WORKDIR = process.cwd();
const SYSTEM_PROMPT = `You are a coding subagent at ${WORKDIR}. Complete the given task, then summarize your findings. Do NOT use the subagent tool - you must complete tasks using bash, read, write, edit, web_fetch, and web_search tools directly.`;

export class SubagentTool extends Tool {
  name = 'subagent';
  description =
    'Dispatch a subagent to handle a task. Use this tool when you need to delegate work to another agent. The subagent will receive the task description and can use all available tools (bash, read, write, edit, web_fetch, web_search) to complete the task. Parameters: task (string, required) - the task description for the subagent to handle.';

  input_schema = {
    type: 'object' as const,
    properties: {
      task: {
        type: 'string',
        description:
          'The task description for the subagent to handle. Be specific about what needs to be done.',
      },
    },
    required: ['task'],
  };

  async execute(input: Record<string, unknown>): Promise<string> {
    const task = String(input.task || '');
    if (!task) {
      return 'Error: No task provided';
    }

    Console.line('[subagent] Starting task');

    try {
      const subagent = new Agent(SYSTEM_PROMPT);
      await subagent.think(task);
      const response = subagent.getResponse();
      Console.line(`[subagent] Completed`);
      return response || '(no response)';
    } catch (e: any) {
      return `Error: ${e.message}`;
    }
  }
}
