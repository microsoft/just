import * as fse from 'fs-extra';
import * as path from 'path';
import { resolve } from './resolve';
import { logger } from 'just-task-logger';

/**
 * Enable typescript support with ts-node.
 * Returns true if successful.
 */
export function enableTypeScript(params: { transpileOnly?: boolean; configFile?: string }): boolean {
  const { transpileOnly = true, configFile = '' } = params;
  const tsNodeModule = resolve('ts-node');

  if (!tsNodeModule) {
    logger.error(`In order to use TypeScript with just.config.ts, you need to install the "ts-node" package.`);
    return false;
  }

  // Use module/moduleResolution "node16" if supported for broadest compatibility
  let supportsNode16Setting = false;
  const typescriptPackageJson = resolve('typescript/package.json');
  if (typescriptPackageJson) {
    const typescriptVersion = fse.readJsonSync(typescriptPackageJson).version as string;
    const [major, minor] = typescriptVersion.split('.').map(Number);
    supportsNode16Setting = major > 4 || (major === 4 && minor >= 7);
  }

  const tsNode = require(tsNodeModule) as typeof import('ts-node');
  const tsNodeMajor = Number(String(tsNode.VERSION || '0').split('.')[0]);
  const ext = path.extname(configFile);
  if (tsNodeMajor < 10 && ext !== '.ts') {
    logger.error(`ts-node >= 10 is required for ${ext} extension support.`);
    return false;
  }

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
  });
  return true;
}
