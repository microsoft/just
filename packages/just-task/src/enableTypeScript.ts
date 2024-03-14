import * as fse from 'fs-extra';
import { resolve } from './resolve';
import { logger } from 'just-task-logger';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function enableTypeScript({ transpileOnly = true }): void {
  const tsNodeModule = resolve('ts-node');

  if (tsNodeModule) {
    // Use module/moduleResolution "node16" if supported for broadest compatibility
    let supportsNode16Setting = false;
    const typescriptPackageJson = resolve('typescript/package.json');
    if (typescriptPackageJson) {
      const typescriptVersion = fse.readJsonSync(typescriptPackageJson).version as string;
      const [major, minor] = typescriptVersion.split('.').map(Number);
      supportsNode16Setting = major > 4 || (major === 4 && minor >= 7);
    }

    const tsNode = require(tsNodeModule);
    tsNode.register({
      transpileOnly,
      skipProject: true,
      compilerOptions: {
        target: 'es2017',
        module: supportsNode16Setting ? 'node16' : 'commonjs',
        strict: false,
        skipLibCheck: true,
        skipDefaultLibCheck: true,
        moduleResolution: supportsNode16Setting ? 'node16' : 'node',
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
