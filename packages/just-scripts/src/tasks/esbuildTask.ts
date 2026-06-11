import type { BuildOptions } from 'esbuild';
import type { TaskFunction } from 'just-task';
import { tryRequire } from '../tryRequire';

export type EsbuildBuildOptions = BuildOptions;

/**
 * Create a task to run esbuild; can be used for bundling or building.
 *
 * Throws if `esbuild` is not found.
 */
export function esbuildTask(options: EsbuildBuildOptions = {}): TaskFunction {
  return async function esbuild() {
    // Resolve first from cwd, then through resolution paths
    const esbuildModule = tryRequire<typeof import('esbuild')>('esbuild');
    if (!esbuildModule) {
      throw new Error('Cannot find esbuild, please add it to your devDependencies');
    }

    return esbuildModule.build(options);
  };
}
