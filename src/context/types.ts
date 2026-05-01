import { ToolResult } from '../tool/types';

export enum ContentBlockType {
  Text = 'text',
  ToolUse = 'tool_use',
}

export interface TextBlock {
  type: ContentBlockType.Text;
  text: string;
}

export interface ToolUseBlock {
  type: ContentBlockType.ToolUse;
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export type ContentBlock = TextBlock | ToolUseBlock;

export enum RoleType {
  User = 'user',
  Assistant = 'assistant',
}

export interface UserMessage {
  role: RoleType.User;
  content: string | ToolResult[];
}

export interface AssistantMessage {
  role: RoleType.Assistant;
  content: ContentBlock[];
}

export type MessageParam = UserMessage | AssistantMessage;
