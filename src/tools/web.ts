import { execSync } from 'child_process';
import { Tool } from './types';

export class WebFetchTool extends Tool {
  name = 'web_fetch';
  description = 'Fetch content from a URL and process it using AI.';
  input_schema = {
    type: 'object' as const,
    properties: {
      url: {
        type: 'string' as const,
        description: 'The URL to fetch content from',
      },
      prompt: {
        type: 'string' as const,
        description: 'What information to extract from the fetched content',
      },
    },
    required: ['url', 'prompt'],
  };

  execute(input: Record<string, unknown>): string {
    const url = String(input.url || '');

    if (!url) {
      return 'Error: url is required';
    }

    try {
      const output = execSync(`curl -sL --max-time 30 -A "Claude Code Agent/1.0" "${url}"`, {
        encoding: 'utf-8',
        timeout: 35000,
      });
      return `Fetched content from ${url}:\n\n${output.slice(0, 50000)}`;
    } catch (e: any) {
      if (e.message.includes('timeout')) {
        return `Error: Request timeout for ${url}`;
      }
      return `Error fetching ${url}: ${e.message}`;
    }
  }
}

export class WebSearchTool extends Tool {
  name = 'web_search';
  description = 'Search the web for information.';
  input_schema = {
    type: 'object' as const,
    properties: {
      query: {
        type: 'string' as const,
        description: 'The search query',
      },
    },
    required: ['query'],
  };

  execute(input: Record<string, unknown>): string {
    const query = String(input.query || '');

    if (!query) {
      return 'Error: query is required';
    }

    return `Web search for: "${query}"

Note: Web search requires API credentials (Google Custom Search, Bing API, etc.)
To implement:
1. Set environment variable SEARCH_API_KEY
2. Use search engine API to get results
3. Return formatted results to user

Example search URLs:
- Google: https://www.google.com/search?q=${encodeURIComponent(query)}
- DuckDuckGo: https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
  }
}
