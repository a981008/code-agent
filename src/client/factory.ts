import { AnthropicClient } from './anthropic';
import { LLMClient } from './types';

export function createLLMClient(): LLMClient {
  const client = new AnthropicClient();
  return client;
}
