import { logger } from 'just-task';

/**
 * Whether the given config path is a TypeScript file that should be loaded via ts-node
 * (matches `.ts`, `.cts`, and `.mts` extensions).
 */
export function isTsConfigFile(configPath: string): boolean {
  return /\.[cm]?ts$/.test(configPath);
}

export function getTsNodeEnv(tsconfig?: string, transpileOnly?: boolean): { [key: string]: string | undefined } {
  const env: { [key: string]: string | undefined } = {};

  if (tsconfig) {
    logger.info(`[TS] Using ${tsconfig}`);
    env.TS_NODE_PROJECT = tsconfig;
  } else {
    // TODO: proper fix for moduleResolution: node10
    const compilerOptions = JSON.stringify({
      module: 'commonjs',
      target: 'es2017',
      moduleResolution: 'node10',
      ignoreDeprecations: '6.0',
    });
    logger.info(`[TS] Using these compilerOptions: ${compilerOptions}`);
    env.TS_NODE_COMPILER_OPTIONS = compilerOptions;
  }

  if (transpileOnly !== false) {
    logger.info('[TS] Using transpileOnly mode');
    env.TS_NODE_TRANSPILE_ONLY = 'true';
  }

  return env;
}
