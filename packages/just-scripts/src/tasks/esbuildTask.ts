import type { BuildOptions } from 'esbuild';
import { resolve, TaskFunction } from 'just-task';

export type EsbuildBuildOptions = BuildOptions;
export interface EsbuildTransformOptions {
  esbuildOptions: BuildOptions;
  include: string[] | string;
}

/**
 * creates a esbuild task function, checking for esbuild's presence; can be used for bundling or building
 */
export function esbuildTask(options: EsbuildBuildOptions = {}): TaskFunction {
  // Resolve first from cwd, then through resolution paths
  const esbuildModuleResolution = resolve('esbuild');

  if (!esbuildModuleResolution) {
    throw new Error('cannot find esbuild, please add it to your devDependencies');
  }

  return async function esbuild() {
    const esbuildModule = require(esbuildModuleResolution) as typeof import('esbuild');
    return esbuildModule.build(options);
  };
}
