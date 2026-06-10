import { resolveCwd } from 'just-task';
import path from 'path';

/**
 * Resolve either the given webpack config or `webpack.config.*`. Returns null if not found.
 */
export function findWebpackConfig(params?: {
  configOption?: string;
  /** try `webpack.serve.config.*` first */
  tryServeConfig?: boolean;
}): string | null {
  const { configOption, tryServeConfig } = params || {};
  if (configOption) {
    // if an absolute path is given, don't attempt to resolve as a package
    return resolveCwd(path.isAbsolute(configOption) ? configOption : path.join('.', configOption));
  }

  const configNames = tryServeConfig ? ['webpack.serve.config', 'webpack.config'] : ['webpack.config'];
  for (const configName of configNames) {
    const configPath = resolveCwd(configName, { extensions: ['.js', '.ts', '.mjs', '.cjs', '.mts', '.cts'] });
    if (configPath) {
      return configPath;
    }
  }

  return null;
}
