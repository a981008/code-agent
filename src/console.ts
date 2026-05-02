import * as readline from 'readline';

export enum Color {
  Reset = '\x1b[0m',
  Red = '\x1b[31m',
  Green = '\x1b[32m',
  Yellow = '\x1b[33m',
  Blue = '\x1b[34m',
  Magenta = '\x1b[35m',
  Cyan = '\x1b[36m',
  Gray = '\x1b[90m',
  Bold = '\x1b[1m',
}

export class Console {
  static output(text: string): void {
    console.log(`${Color.Green}agent >> ${Color.Reset}${text}`);
  }

  static error(text: string): void {
    console.error(`${Color.Red}error >> ${Color.Reset}${text}`);
  }

  static tool_call(text: string): void {
    const maxLen = 100;
    const display = text.length > maxLen ? text.slice(0, maxLen) + '...(truncated)' : text;
    console.log(`${Color.Gray}tool_call >> ${display}${Color.Reset}`);
  }

  static tool_result(text: string): void {
    const maxLen = 100;
    const display = text.length > maxLen ? text.slice(0, maxLen) + '...(truncated)' : text;
    console.log(`${Color.Gray}tool_result >> ${display}${Color.Reset}`);
  }

  static line(text?: string): void {
    console.log(`${Color.Gray}===================${text}===================${Color.Reset}`);
  }

  static banner(): void {
    const model =
      process.env.ANTHROPIC_MODEL || process.env.MODEL_ID || 'claude-sonnet-4-7-20250514';
    const baseURL = process.env.ANTHROPIC_BASE_URL;

    console.log(`${Color.Green}🤖 Code Agent CLI${Color.Reset}`);
    console.log(`${Color.Gray}Model: ${Color.Reset}${Color.Cyan}${model}${Color.Reset}`);
    if (baseURL) {
      console.log(`${Color.Gray}BaseURL: ${Color.Reset}${Color.Cyan}${baseURL}${Color.Reset}`);
    }
    console.log(`${Color.Gray}───────────────────────────────────────────${Color.Reset}`);
    console.log(`${Color.Yellow}Type 'q' or 'exit' to quit${Color.Reset}`);
  }

  static async ask(rl: readline.Interface): Promise<string> {
    return new Promise(resolve => {
      rl.question(`${Color.Cyan}user >> ${Color.Reset}`, answer => resolve(answer));
    });
  }
}
