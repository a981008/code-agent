// Tool 抽象基类
export abstract class Tool {
  abstract name: string;
  abstract description: string;
  abstract inputSchema: object;

  abstract execute(input: Record<string, unknown>): string;
}
