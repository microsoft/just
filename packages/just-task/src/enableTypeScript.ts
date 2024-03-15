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

  // Try to determine if the user is already running with a known transpiler.
  // ts-node makes this easy by setting process.env.TS_NODE.
  // tsx doesn't set a variable, so check a few places it might show up.
  const contextVals = [
    ...process.argv,
    ...process.execArgv,
    process.env._,
    process.env.npm_lifecycle_event,
    process.env.npm_config_argv,
  ];
  if (process.env.TS_NODE || contextVals.some(val => /[^.]tsx\b/.test(val || ''))) {
    // It appears the user ran the just CLI with tsx or ts-node, so allow this.
    return true;
  }

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
