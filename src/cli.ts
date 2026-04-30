import * as readline from "readline";
import { Agent } from "./agent.js";
import { Console, Color } from "./console.js";

export class CLI {
  private rl: readline.Interface;
  private agent: Agent;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    this.agent = new Agent();
  }

  async run(): Promise<void> {
    Console.banner();

    while (true) {
      const query = await Console.ask(this.rl);

      if (!query.trim() || query.toLowerCase() === "q" || query.toLowerCase() === "exit") {
        console.log(`\n${Color.Gray}Goodbye!${Color.Reset}\n`);
        break;
      }

      await this.agent.think(query);

      const response = this.agent.getResponse();
      if (response) {
        Console.output(response);
      }
    }

    this.rl.close();
  }
}
