const path = require('path');

export function isChildOf(child: string, parent: string): boolean {
  const relativePath = path.relative(child, parent);
  return /^[.\/\\]+$/.test(relativePath);
}
