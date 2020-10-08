import { resolveCwd } from 'just-task';
import * as path from 'path';

export function findWebpackConfig(target: string, config?: string) {
  let configPath: string = target;

  const haystackConfigPaths = [config, target, target.replace(/\.js$/, '.ts')];
  for (const needle of haystackConfigPaths) {
    if (needle && resolveCwd(path.join('.', needle))) {
      configPath = needle;
      break;
    }
  }

  return configPath;
}
