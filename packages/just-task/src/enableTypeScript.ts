import { resolveCwd } from './resolve';
import { logger } from 'just-task-logger';

export function enableTypeScript({ transpileOnly = true }) {
  const tsNodeModule = resolveCwd('ts-node');
  if (tsNodeModule) {
    const tsNode = require(tsNodeModule);
    tsNode.register({
      transpileOnly
    });
  } else {
    logger.error(`In order to use TypeScript with just.config.ts, you need to install "ts-node" module:

  npm install -D ts-node

or

  yarn add -D ts-node

`);
  }
}
