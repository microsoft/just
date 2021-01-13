import { resolve } from 'just-task';

export function tryRequire(specifier: string): any {
  const resolved = resolve(specifier);

  if (!resolved) {
    return null;
  }

  let requiredModule = null;

  try {
    requiredModule = require(resolved);
  } catch (e) {
    // ignore
  }

  return requiredModule;
}
