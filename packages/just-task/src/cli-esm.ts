import { logger } from 'just-task-logger';
import * as path from 'path';
import { _spawnWithTS } from './spawnWithTS';

_spawnWithTS({
  cmd: path.join(__dirname, 'cli.js'),
  args: process.argv.slice(2),
  executor: ['tsx', 'ts-node-esm'],
  opts: {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_OPTIONS: [
        // Preserve any existing NODE_OPTIONS that were passed as a variable
        ...(process.env.NODE_OPTIONS ? [process.env.NODE_OPTIONS] : []),
        // Also pass through the node options that were passed to this process
        ...process.execArgv,
      ].join(' '),
    },
  },
}).catch(err => {
  logger.error(err);
  process.exit(1);
});
