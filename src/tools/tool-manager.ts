import { Tool } from "./tool.js";

export class ToolManager {
  private tools: Map<string, Tool> = new Map();

  register(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  get(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }

  list(): Tool[] {
    return Array.from(this.tools.values());
  }

  getDefinitions(): Array<{
    name: string;
    description: string;
    input_schema: object;
  }> {
    return this.list().map((tool) => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.inputSchema,
    }));
  }
}
