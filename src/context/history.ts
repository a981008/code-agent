import { ContentBlock, MessageParam, TextBlock, ContentBlockType, RoleType } from './types';
import { ToolResult } from '../tool/types';

export class History {
  private messages: MessageParam[] = [];

  addUser(content: string): void {
    this.messages.push({ role: RoleType.User, content });
  }

  addAssistant(content: ContentBlock[]): void {
    this.messages.push({ role: RoleType.Assistant, content });
  }

  addToolResults(results: ToolResult[]): void {
    this.messages.push({ role: RoleType.User, content: results });
  }

  getMessages(): MessageParam[] {
    return this.messages;
  }

  getLastResponse(): string {
    const last = this.messages[this.messages.length - 1];
    if (!last) return '';

    const content = last.content;
    if (Array.isArray(content)) {
      return content
        .filter(b => b.type === ContentBlockType.Text)
        .map(b => (b as TextBlock).text)
        .join('\n');
    }
    return content as string;
  }
}
