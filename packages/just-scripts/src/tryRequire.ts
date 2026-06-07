import { resolve } from 'just-task';

export function tryRequire<T = any>(specifier: string): T | null {
  const resolved = resolve(specifier);

  if (!resolved) {
    return null;
  }

  try {
    return require(resolved) as T;
  } catch (e) {
    return null;
  }
}
