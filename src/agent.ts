import { ToolResult, Tool } from './tools/types';
import { ToolManager } from './tools/manager';
import { LLMClient } from './client/types';
import { createLLMClient } from './client/factory';
import { Console } from './console';
import { History } from './context/history';
import { ContentBlockType } from './context/types';

export class Agent {
  private llm: LLMClient;
  private toolManager: ToolManager;
  private system: string;
  private history: History;
  private totalUsage = { input: 0, output: 0 };
  private readonly SYSTEM_PROMPT =
    "You are a coding agent called code-agent. Use bash to solve tasks. Act, don't explain.";

  constructor() {
    this.llm = createLLMClient();
    this.toolManager = new ToolManager();
    this.system = this.SYSTEM_PROMPT;
    this.history = new History();
  }

  registerTool(tool: Tool): void {
    this.toolManager.register(tool);
  }

  async think(query: string): Promise<void> {
    this.history.addUser(query);

    while (true) {
      const response = await this.llm.create(
        this.history.getMessages(),
        this.toolManager.getDefinitions(),
        this.system
      );

      const responseContent = response.content;

      if (!responseContent || responseContent.length === 0) {
        Console.error('No response from model');
        return;
      }

      this.history.addAssistant(responseContent);

      if (response.stop_reason !== ContentBlockType.ToolUse) {
        return;
      }

      const results: ToolResult[] = [];
      for (const block of responseContent) {
        if (block.type === ContentBlockType.ToolUse) {
          const tool = this.toolManager.get(block.name);
          if (tool) {
            const output = tool.execute(block.input);
            Console.tool_call(`${block.name}: ${JSON.stringify(block.input)}`);
            Console.tool_result(output);
            results.push({
              type: 'tool_result',
              tool_use_id: block.id,
              content: output,
            });
          }
        }
      }

      this.history.addToolResults(results);
    }
  }

  getResponse(): string {
    return this.history.getLastResponse();
  }
}
