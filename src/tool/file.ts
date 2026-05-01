import { readFileSync, writeFileSync, existsSync } from 'fs';
import { isAbsolute, resolve } from 'path';
import { Tool } from './types';

function resolvePath(filePath: string): string {
  return isAbsolute(filePath) ? filePath : resolve(process.cwd(), filePath);
}

export class ReadTool extends Tool {
  name = 'read';
  description = 'Read file contents from the local filesystem.';
  input_schema = {
    type: 'object' as const,
    properties: {
      file_path: {
        type: 'string' as const,
        description: 'Absolute path to the file to read',
      },
      offset: {
        type: 'number' as const,
        description: 'Line number to start reading from (1-based)',
      },
      limit: {
        type: 'number' as const,
        description: 'Maximum number of lines to read',
      },
    },
    required: ['file_path'],
  };

  execute(input: Record<string, unknown>): string {
    const filePath = resolvePath(String(input.file_path || ''));

    if (!existsSync(filePath)) {
      return `Error: File not found: ${filePath}`;
    }

    try {
      const content = readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');

      const offset = Number(input.offset || 1);
      const limit = Number(input.limit || 0);

      if (offset < 1 || offset > lines.length) {
        return `Error: Invalid offset ${offset}, file has ${lines.length} lines`;
      }

      if (limit > 0) {
        const start = offset - 1;
        const end = Math.min(start + limit, lines.length);
        return lines.slice(start, end).join('\n');
      }

      return lines.slice(offset - 1).join('\n');
    } catch (e: any) {
      return `Error reading file: ${e.message}`;
    }
  }
}

export class WriteTool extends Tool {
  name = 'write';
  description = 'Write content to a file, creating it or overwriting it entirely.';
  input_schema = {
    type: 'object' as const,
    properties: {
      file_path: {
        type: 'string' as const,
        description: 'Absolute path to the file to write',
      },
      content: {
        type: 'string' as const,
        description: 'Content to write to the file',
      },
    },
    required: ['file_path', 'content'],
  };

  execute(input: Record<string, unknown>): string {
    const filePath = resolvePath(String(input.file_path || ''));
    const content = String(input.content || '');

    if (!filePath) {
      return 'Error: file_path is required';
    }

    try {
      writeFileSync(filePath, content, 'utf-8');
      return `Successfully wrote to ${filePath}`;
    } catch (e: any) {
      return `Error writing file: ${e.message}`;
    }
  }
}

export class EditTool extends Tool {
  name = 'edit';
  description =
    'Edit a file by replacing exact string matches. Use when you need to change specific parts of a file.';
  input_schema = {
    type: 'object' as const,
    properties: {
      file_path: {
        type: 'string' as const,
        description: 'Absolute path to the file to edit',
      },
      old_string: {
        type: 'string' as const,
        description: 'Exact string to find and replace. Must match the file content exactly.',
      },
      new_string: {
        type: 'string' as const,
        description: 'Replacement string',
      },
    },
    required: ['file_path', 'old_string', 'new_string'],
  };

  execute(input: Record<string, unknown>): string {
    const filePath = resolvePath(String(input.file_path || ''));
    const oldString = String(input.old_string || '');
    const newString = String(input.new_string || '');

    if (!existsSync(filePath)) {
      return `Error: File not found: ${filePath}`;
    }

    if (!oldString) {
      return 'Error: old_string is required';
    }

    try {
      const content = readFileSync(filePath, 'utf-8');

      if (!content.includes(oldString)) {
        return `Error: old_string not found in file. No changes made.`;
      }

      const count = (
        content.match(new RegExp(oldString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []
      ).length;
      if (count > 1) {
        return `Error: old_string appears ${count} times in the file. Make old_string more specific to match exactly once.`;
      }

      const newContent = content.replace(oldString, newString);
      writeFileSync(filePath, newContent, 'utf-8');
      return `Successfully edited ${filePath}`;
    } catch (e: any) {
      return `Error editing file: ${e.message}`;
    }
  }
}
