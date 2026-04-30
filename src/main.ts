import "dotenv/config";
import { CLI } from "./cli.js";
import { Console } from "./console.js";

const cli = new CLI();
cli.run().catch((e) => Console.error(e));
