import Anthropic from '@anthropic-ai/sdk';
import { LLMMessage, LLMResponse } from './types';
import { ContentBlockType } from '../context/types';
import { ToolDefinition } from '../tool/types';

export class AnthropicClient {
  private model: string;
  private baseURL?: string;
  private authToken?: string;

  constructor(model?: string) {
    this.model =
      model || process.env.ANTHROPIC_MODEL || process.env.MODEL_ID || 'claude-sonnet-4-7-20250514';
    this.baseURL = process.env.ANTHROPIC_BASE_URL;
    this.authToken = process.env.ANTHROPIC_AUTH_TOKEN || process.env.ANTHROPIC_API_KEY;
  }

  private createClient(): Anthropic {
    return new Anthropic({
      baseURL: this.baseURL,
      apiKey: this.authToken,
    });
  }

  async create(
    messages: LLMMessage[],
    tools: ToolDefinition[],
    system: string
  ): Promise<LLMResponse> {
    const client = this.createClient();
    const response: LLMResponse = { content: [], stop_reason: '' };

    const stream = client.messages.stream({
      model: this.model,
      system,
      messages: messages as any,
      tools: tools as any,
      max_tokens: 196608,
    });

    const toolBuffer: Map<number, { id: string; name: string; input: string }> = new Map();

    for await (const event of stream as any) {
      if (event.type === 'content_block_start') {
        const idx = event.index;
        if (event.content_block.type === 'tool_use') {
          toolBuffer.set(idx, {
            id: event.content_block.id || '',
            name: event.content_block.name || '',
            input: '',
          });
        }
      }

      if (event.type === 'content_block_delta') {
        const idx = event.index;
        if (event.delta.type === 'text_delta') {
          response.content.push({
            type: ContentBlockType.Text,
            text: event.delta.text,
          });
        }
        if (event.delta.type === 'input_json_delta') {
          const tool = toolBuffer.get(idx);
          if (tool) {
            tool.input += event.delta.partial_json;
          }
        }
      }

      if (event.type === 'content_block_stop') {
        const idx = event.index;
        const tool = toolBuffer.get(idx);
        if (tool && tool.name) {
          response.content.push({
            type: ContentBlockType.ToolUse,
            id: tool.id,
            name: tool.name,
            input: tool.input ? JSON.parse(tool.input) : {},
          });
        }
      }

      if (event.type === 'message_delta') {
        if (event.delta.stop_reason) {
          response.stop_reason = event.delta.stop_reason;
        }
      }
    }

    return response;
  }
}
