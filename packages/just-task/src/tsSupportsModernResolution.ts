import * as fse from 'fs-extra';
import { resolve } from './resolve';

/**
 * Returns whether the local version of typescript supports modern resolution settings like `NodeNext`.
 * Defaults to false (for compatibility with before this check was added) if typescript is not found.
 * @internal Exported for use by `just-scripts` only.
 */
export function _tsSupportsModernResolution(): boolean {
  const typescriptPackageJson = resolve('typescript/package.json');
  if (typescriptPackageJson) {
    const typescriptVersion = fse.readJsonSync(typescriptPackageJson).version as string;
    const [major, minor] = typescriptVersion.split('.').map(Number);
    return major > 4 || (major === 4 && minor >= 7);
  }
  return false;
}
