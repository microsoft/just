import { logger } from 'just-task';

export function getTsNodeEnv(tsconfig?: string, transpileOnly?: boolean): { [key: string]: string | undefined } {
  const env: { [key: string]: string | undefined } = {};

  if (tsconfig) {
    logger.info(`[TS] Using ${tsconfig}`);
    env.TS_NODE_PROJECT = tsconfig;
  } else {
    const compilerOptions = JSON.stringify({ module: 'commonjs', target: 'es2017', moduleResolution: 'node' });
    logger.info(`[TS] Using these compilerOptions: ${compilerOptions}`);
    env.TS_NODE_COMPILER_OPTIONS = compilerOptions;
  }

  if (transpileOnly !== false) {
    logger.info('[TS] Using transpileOnly mode');
    env.TS_NODE_TRANSPILE_ONLY = 'true';
  }

  return env;
}
