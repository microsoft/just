import { resolveCwd } from 'just-task';
import * as path from 'path';

export function findWebpackConfig(...targets: string[]): string | null {
  for (const target of targets) {
    const haystackConfigPaths = [target, target.replace(/\.js$/, '.ts')];
    for (const needle of haystackConfigPaths) {
      if (needle && resolveCwd(path.join('.', needle))) {
        return needle;
      }
    }
  }

  return null;
}
