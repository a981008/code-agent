import { ContentBlock, MessageParam } from '../context/types';
import { ToolDefinition } from '../tool/types';

export interface LLMResponse {
  content: ContentBlock[];
  stop_reason: string;
}

export type LLMMessage = MessageParam;

export interface LLMClient {
  create(messages: LLMMessage[], tools: ToolDefinition[], system: string): Promise<LLMResponse>;
}
