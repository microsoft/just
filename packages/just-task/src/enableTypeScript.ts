import { resolve } from './resolve';
import { logger } from './logger';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function enableTypeScript({ transpileOnly = true }): void {
  const tsNodeModule = resolve('ts-node');
  if (tsNodeModule) {
    const tsNode = require(tsNodeModule);
    tsNode.register({
      transpileOnly,
      skipProject: true,
      compilerOptions: {
        target: 'es2017',
        module: 'commonjs',
        strict: false,
        skipLibCheck: true,
        skipDefaultLibCheck: true,
        moduleResolution: 'node',
        allowJs: true,
        esModuleInterop: true,
      },
      files: ['just.config.ts'],
    });
  } else {
    logger.error(`In order to use TypeScript with just.config.ts, you need to install "ts-node" module:

  npm install -D ts-node

or

  yarn add -D ts-node

`);
  }
}
