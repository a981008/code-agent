import Anthropic from "@anthropic-ai/sdk";
import { BashTool, toolManager } from "./tools/index.js";
import { Console } from "./console.js";

interface ToolResult {
  type: "tool_result";
  tool_use_id: string;
  content: string;
}

interface TextBlock {
  type: "text";
  text: string;
}

interface ToolUseBlock {
  type: "tool_use";
  id: string;
  name: string;
  input: Record<string, unknown>;
}

type ContentBlock = TextBlock | ToolUseBlock;

interface UserMessage {
  role: "user";
  content: string | ToolResult[];
}

interface AssistantMessage {
  role: "assistant";
  content: ContentBlock[];
}

type MessageParam = UserMessage | AssistantMessage;

export class Agent {
  private client: Anthropic;
  private model: string;
  private system: string;
  private history: MessageParam[] = [];

  constructor(
    model = process.env.MODEL_ID || "claude-sonnet-4-7-20250514",
    system = `You are a coding agent. Use bash to solve tasks. Act, don't explain.`
  ) {
    this.client = new Anthropic();
    this.model = model;
    this.system = system;
  }

  async think(query: string): Promise<void> {
    this.history.push({ role: "user", content: query });

    while (true) {
      const stream = this.client.messages.stream({
        model: this.model,
        system: this.system,
        messages: this.history as any,
        tools: toolManager.getDefinitions() as any,
        max_tokens: 196608,
      });

      let responseContent: ContentBlock[] = [];
      let stop_reason = "";

      for await (const event of stream as any) {
        if (event.type === "message_start") {
          responseContent = event.message.content;
        }
        if (event.type === "message_delta") {
          stop_reason = event.delta.stop_reason || "";
        }
      }

      if (!responseContent || responseContent.length === 0) {
        Console.error("No response from model");
        return;
      }

      this.history.push({ role: "assistant", content: responseContent });

      if (stop_reason !== "tool_use") {
        return;
      }

      const results: ToolResult[] = [];
      for (const block of responseContent) {
        if (block.type === "tool_use") {
          const tool = toolManager.get(block.name);
          if (tool) {
            const output = tool.execute(block.input);
            Console.tool_call(`${block.name}: ${JSON.stringify(block.input)}`);
            Console.tool_result(output.slice(0, 200));
            results.push({
              type: "tool_result",
              tool_use_id: block.id,
              content: output,
            });
          }
        }
      }

      this.history.push({ role: "user", content: results });
    }
  }

  getResponse(): string {
    const last = this.history[this.history.length - 1];
    if (!last) return "";

    const content = last.content;
    if (Array.isArray(content)) {
      return content
        .filter((b) => b.type === "text")
        .map((b) => (b as TextBlock).text)
        .join("\n");
    }
    return content as string;
  }
}
