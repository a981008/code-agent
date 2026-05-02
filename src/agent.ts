import { ToolResult, Tool } from './tool/types';
import { ToolManager } from './tool/manager';
import { LLMClient } from './client/types';
import { createLLMClient } from './client/factory';
import { Console } from './console';
import { History } from './context/history';
import { ContentBlockType } from './context/types';
import { skillLoader } from './skill/loader';

export class Agent {
  private llm: LLMClient;
  private toolManager: ToolManager;
  private system: string;
  private history: History;

  constructor(systemPrompt: string) {
    this.llm = createLLMClient();
    this.toolManager = new ToolManager();
    this.history = new History();
    const skills = skillLoader
      .list()
      .map(s => `- ${s.name}: ${s.description}`)
      .join('\n');
    this.system = systemPrompt + '\n\nAvailable skills:\n' + skills;
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
            const output = await tool.execute(block.input);
            Console.tool_call(`${block.name}: ${JSON.stringify(block.input)}`);
            Console.tool_result(`${output}`);
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
