export abstract class Tool implements ToolDefinition {
  abstract name: string;
  abstract description: string;
  abstract input_schema: Record<string, unknown>;

  abstract execute(input: Record<string, unknown>): string;
}

export interface ToolResult {
  type: 'tool_result';
  tool_use_id: string;
  content: string;
}

export interface ToolDefinition {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}
