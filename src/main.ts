import { resolve } from 'path';
import { config } from 'dotenv';
config({ path: resolve(process.cwd(), '.env') });

import { CLI } from './cli';
import { Console } from './console';

const cli = new CLI();
cli.run().catch(e => Console.error(e));
