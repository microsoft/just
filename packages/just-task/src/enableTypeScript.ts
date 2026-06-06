import { resolve } from './resolve';
import { logger } from './logger';

export function enableTypeScript({ transpileOnly = true, esm = false }): void {
  const tsNodeModule = resolve('ts-node');
  if (tsNodeModule) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const tsNode = require(tsNodeModule);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    tsNode.register({
      transpileOnly,
      skipProject: true,
      compilerOptions: {
        target: 'es2017',
        module: esm ? 'node16' : 'commonjs',
        strict: false,
        skipLibCheck: true,
        skipDefaultLibCheck: true,
        // TODO: proper fix for moduleResolution: node10
        moduleResolution: esm ? 'node16' : 'node10',
        ignoreDeprecations: '6.0',
        allowJs: true,
        esModuleInterop: true,
      },
      files: ['just.config.ts', 'just.config.cts'],
    });
  } else {
    logger.error(`In order to use TypeScript with just.config.ts, you need to install "ts-node" module:

  npm install -D ts-node

or

  yarn add -D ts-node

`);
  }
}
