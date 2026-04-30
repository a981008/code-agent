import * as readline from "readline";

// 颜色枚举
export enum Color {
  Reset = "\x1b[0m",
  Red = "\x1b[31m",
  Green = "\x1b[32m",
  Yellow = "\x1b[33m",
  Blue = "\x1b[34m",
  Magenta = "\x1b[35m",
  Cyan = "\x1b[36m",
  Gray = "\x1b[90m",
  Bold = "\x1b[1m",
}

// 控制台输出类
export class Console {
  static output(text: string): void {
    console.log(`${Color.Green}agent >> ${Color.Reset}${text}`);
  }

  static error(text: string): void {
    console.error(`${Color.Red}error${Color.Reset} >> ${text}`);
  }

  static tool_call(text: string): void {
    console.log(`${Color.Gray}tool_call >> ${text}${Color.Reset}`);
  }

  static tool_result(text: string): void {
    console.log(`${Color.Gray}tool_result >> ${text}${Color.Reset}`);
  }

  static banner(): void {
    console.log(`${Color.Gray}═══════════════════════════════════════════${Color.Reset}`);
    console.log(`  ${Color.Green}🤖 Agent Loop CLI${Color.Reset} - Claude Integration`);
    console.log(`  ${Color.Gray}Type 'q' or 'exit' to quit${Color.Reset}`);
    console.log(`${Color.Gray}═══════════════════════════════════════════${Color.Reset}`);
  }

  static async ask(rl: readline.Interface): Promise<string> {
    return new Promise((resolve) => {
      rl.question(`${Color.Cyan}user >> ${Color.Reset}`, (answer) => resolve(answer));
    });
  }

}
