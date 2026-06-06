import { resolve } from 'just-task';

export function tryRequire(specifier: string): any {
  const resolved = resolve(specifier);

  if (!resolved) {
    return null;
  }

  try {
    return require(resolved);
  } catch (e) {
    return null;
  }
}
