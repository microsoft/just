import * as fs from 'fs';
import * as path from 'path';

/** Get the path to a mock script file (verifying that it exists) */
export function getMockScript(
  name: 'mock-fail.js' | 'mock-success.js' | 'mock-forever.js' | 'mock-success.ts' | 'mock-fail.ts',
): string {
  const script = path.join(__dirname, name);
  expect(fs.existsSync(script)).toBe(true);
  return script;
}
