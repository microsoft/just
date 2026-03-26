import { resolve } from 'just-task';

export function tryRequire<T = any>(specifier: string): T | null {
  const resolved = resolve(specifier);

  if (!resolved) {
    return null;
  }

  let requiredModule: T | null = null;

  try {
    requiredModule = require(resolved);
  } catch (e) {
    // ignore
  }

  return requiredModule;
}
