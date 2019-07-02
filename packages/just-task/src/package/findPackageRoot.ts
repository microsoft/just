import path from 'path';
import { resolveCwd } from '../resolve';

export function findPackageRoot() {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const packageJsonFilePath = resolveCwd('package.json')!;
  return path.dirname(packageJsonFilePath);
}
