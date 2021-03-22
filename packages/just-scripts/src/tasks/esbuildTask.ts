import type { BuildOptions } from 'esbuild';
import { resolveCwd, TaskFunction } from 'just-task';

export type EsbuildBuildOptions = BuildOptions;
export interface EsbuildTransformOptions {
  esbuildOptions: BuildOptions;
  include: string[] | string;
}

/**
 * creates a esbuild task function, checking for esbuild's presence; can be used for bundling or building
 */
export function esbuildTask(options: EsbuildBuildOptions = {}): TaskFunction {
  const esbuildModuleResolution = resolveCwd('esbuild');

  if (!esbuildModuleResolution) {
    throw new Error('cannot find esbuild, please add it to your devDependencies');
  }

  return async function esbuild() {
    const esbuildModule = require(esbuildModuleResolution) as typeof import('esbuild');
    return esbuildModule.build(options);
  };
}
