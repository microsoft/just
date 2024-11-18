import { logger, TSExecutor, _tsSupportsModernResolution } from 'just-task';

/**
 * Get environment variables for `ts-node` or `tsx`.
 */
export function getTsNodeEnv(
  tsconfig?: string,
  transpileOnly?: boolean,
  executor: TSExecutor = 'ts-node',
): { [key: string]: string | undefined } {
  const env: { [key: string]: string | undefined } = {};

  if (tsconfig) {
    logger.info(`[TS] Using ${tsconfig}`);
    if (executor === 'tsx') {
      env.TSX_TSCONFIG_PATH = tsconfig;
    } else {
      env.TS_NODE_PROJECT = tsconfig;
    }
  } else if (executor.startsWith('ts-node')) {
    const supportsNode16 = _tsSupportsModernResolution();
    const compilerOptions = JSON.stringify({
      target: 'es2017',
      moduleResolution: supportsNode16 ? 'Node16' : 'node',
      module: supportsNode16 ? 'Node16' : 'commonjs',
      skipLibCheck: true,
    });
    logger.info(`[TS] Using these compilerOptions: ${compilerOptions}`);
    env.TS_NODE_COMPILER_OPTIONS = compilerOptions;
  }

  if (executor.startsWith('ts-node') && transpileOnly !== false) {
    logger.info('[TS] Using transpileOnly mode');
    env.TS_NODE_TRANSPILE_ONLY = 'true';
    // tsx always transpiles only (no type checking)
  }

  return env;
}
