import { afterEach, describe, expect, it } from '@jest/globals';
import fs from 'fs';
import os from 'os';
import path from 'path';

describe('webpackTask', () => {
  let tempDir: string | undefined;

  afterEach(() => {
    if (tempDir) {
      fs.rmSync(tempDir, { recursive: true, force: true });
      tempDir = undefined;
    }
  });

  it.each([
    ['cjs', 'CommonJS'],
    ['mjs', 'default'],
    ['cts', 'CommonJS'],
    ['mts', 'default'],
    ['mjs', 'named'],
    ['mts', 'named'],
  ] as const)('loads a native .%s config with %s exports in a real Node process', async (extension, exportStyle) => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'webpack native #'));
    const cwd = fs.realpathSync(tempDir);
    const configFile = path.join(cwd, `webpack.config.${extension}`);
    const config = JSON.stringify({
      mode: 'development',
      entry: './entry.js',
      output: { path: path.join(cwd, 'dist'), filename: 'bundle.js' },
    });
    const annotation = extension.endsWith('ts') ? ": import('webpack').Configuration" : '';
    const exportStatement = {
      CommonJS: 'module.exports = config;',
      default: 'await Promise.resolve(); export default config;',
      named: 'await Promise.resolve(); export const { mode, entry, output } = config;',
    }[exportStyle];
    fs.writeFileSync(configFile, `const config${annotation} = ${config};\n${exportStatement}`);
    fs.writeFileSync(path.join(cwd, 'entry.js'), 'console.log("native webpack build");');
    const taskPath = path.resolve(__dirname, '../../../lib/tasks/webpackTask.js');
    const script = `require(${JSON.stringify(taskPath)}).webpackTask({ config: ${JSON.stringify(configFile)} })().catch(error => { console.error(error); process.exitCode = 1; });`;
    const nanoSpawn = (await import('nano-spawn')).default;
    const { stdout } = await nanoSpawn(process.execPath, ['-e', script], { cwd });
    expect(stdout).toContain('Running Webpack');
    expect(fs.existsSync(path.join(cwd, 'dist/bundle.js'))).toBe(true);
  });
});
