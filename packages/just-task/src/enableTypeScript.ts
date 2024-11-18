import * as path from 'path';
import { resolve } from './resolve';
import { logger } from 'just-task-logger';
import { _tsSupportsModernResolution } from './tsSupportsModernResolution';

/**
 * Enable typescript support with ts-node.
 * Returns true if successful.
 */
export function enableTypeScript(params: { transpileOnly?: boolean; configFile?: string }): boolean {
  const { transpileOnly = true, configFile = '' } = params;

  if (process.env.JUST_TASK_TS) {
    // Already running with a TS loader (this env is set by spawnWithTS, used by just-scripts-esm binary)
    return true;
  }

  const tsNodeModule = resolve('ts-node');

  if (!tsNodeModule) {
    logger.error(`In order to use TypeScript with just.config.ts, you need to install the "ts-node" package.`);
    return false;
  }

  // Use module/moduleResolution "node16" if supported for broadest compatibility
  const supportsNode16Setting = _tsSupportsModernResolution();

  const tsNode = require(tsNodeModule);
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
