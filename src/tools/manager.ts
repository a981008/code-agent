import { Tool, ToolDefinition } from './types';
import { getRegisteredTools } from './registry';

export class ToolManager {
  private tools: Map<string, Tool> = new Map();

  constructor() {
    for (const tool of getRegisteredTools()) {
      this.register(tool);
    }
  }

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

  getDefinitions(): ToolDefinition[] {
    return this.list();
  }
}
