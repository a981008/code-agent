import { execSync } from 'child_process';
import { Tool } from './types';

export class BashTool extends Tool {
  name = 'bash';
  description = 'Run a shell command.';
  input_schema = {
    type: 'object' as const,
    properties: {
      command: { type: 'string' as const },
    },
    required: ['command'],
  };

  private dangerous = ['rm -rf /', 'sudo', 'shutdown', 'reboot', '> /dev/'];

  execute(input: Record<string, unknown>): string {
    const command = String(input.command || '');
    if (this.dangerous.some(d => command.includes(d))) {
      return 'Error: Dangerous command blocked';
    }
    try {
      const output = execSync(command, {
        cwd: process.cwd(),
        timeout: 120000,
        encoding: 'utf-8',
      });
      return (output as string).slice(0, 50000) || '(no output)';
    } catch (e: any) {
      if (e.stdout) return e.stdout.slice(0, 50000);
      if (e.stderr) return e.stderr.slice(0, 50000);
      return `Error: ${e.message}`;
    }
  }
}
