import * as path from 'path';
import { resolve } from '../resolve';

export function findPackageRoot(): string {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const packageJsonFilePath = resolve('package.json')!;
  return path.dirname(packageJsonFilePath);
}
