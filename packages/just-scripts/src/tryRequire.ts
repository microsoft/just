export function tryRequire(specifier: string) {
  let requiredModule = null;

  try {
    requiredModule = require(specifier);
  } catch (e) {
    // ignore
  }

  return requiredModule;
}
