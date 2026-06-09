import type { BuildOptions } from 'esbuild';
import type { TaskFunction } from 'just-task';
import { resolveWrapper } from '../tryRequire';

export type EsbuildBuildOptions = BuildOptions;
export interface EsbuildTransformOptions {
  esbuildOptions: BuildOptions;
  include: string[] | string;
}

/**
 * Create a task to run esbuild; can be used for bundling or building.
 *
 * Throws if `esbuild` is not found.
 */
export function esbuildTask(options: EsbuildBuildOptions = {}): TaskFunction {
  // Resolve first from cwd, then through resolution paths
  const esbuildModuleResolution = resolveWrapper('esbuild');

  if (!esbuildModuleResolution) {
    throw new Error('Cannot find esbuild, please add it to your devDependencies');
  }

  return async function esbuild() {
    const esbuildModule = require(esbuildModuleResolution) as typeof import('esbuild');
    return esbuildModule.build(options);
  };
}
