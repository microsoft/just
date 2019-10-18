import { resolve } from './resolve';
import { logger } from 'just-task-logger';

export function enableTypeScript({ transpileOnly = true }) {
  const tsNodeModule = resolve('ts-node');
  if (tsNodeModule) {
    const tsNode = require(tsNodeModule);
    tsNode.register({
      transpileOnly,
      skipProject: true,
      compilerOptions: {
        target: 'esnext',
        module: 'commonjs',
        strict: false,
        skipLibCheck: true,
        skipDefaultLibCheck: true,
        moduleResolution: 'node',
        allowJs: true,
        esModuleInterop: true
      },
      files: ['just.config.ts']
    });
  } else {
    logger.error(`In order to use TypeScript with just.config.ts, you need to install "ts-node" module:

  npm install -D ts-node

or

  yarn add -D ts-node

`);
  }
}
