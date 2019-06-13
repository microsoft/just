import path from 'path';
import { resolveCwd } from '../resolve';

export function findPackageRoot() {
  const packageJsonFilePath = resolveCwd('package.json')!;
  return path.dirname(packageJsonFilePath);
}
