import * as readline from 'readline';
import { Agent } from './agent';
import { Console, Color } from './console';
import { SubagentTool } from './tools/subagent';

const WORKDIR = process.cwd();
const SYSTEM_PROMPT = `You are a coding agent called code-agent at ${WORKDIR}. Use the subagent tool to delegate exploration or subtasks.`;

export class CLI {
  private rl: readline.Interface;
  private agent: Agent;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    this.agent = new Agent(SYSTEM_PROMPT);
    this.agent.registerTool(new SubagentTool());
  }

  async run(): Promise<void> {
    Console.banner();

    while (true) {
      const query = await Console.ask(this.rl);

      if (!query.trim() || query.toLowerCase() === 'q' || query.toLowerCase() === 'exit') {
        console.log(`\n${Color.Gray}Goodbye!${Color.Reset}\n`);
        break;
      }

      await this.agent.think(query);

      const response = this.agent.getResponse().trim();
      if (response) {
        Console.output(response);
      }
    }

    this.rl.close();
  }
}
