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

  it.each(['cjs', 'mjs', 'cts', 'mts'])('loads a native .%s config in a real Node process', async extension => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'webpack native #'));
    const cwd = fs.realpathSync(tempDir);
    const configFile = path.join(cwd, `webpack.config.${extension}`);
    const config = JSON.stringify({
      mode: 'development',
      entry: './entry.js',
      output: { path: path.join(cwd, 'dist'), filename: 'bundle.js' },
    });
    const esm = extension === 'mjs' || extension === 'mts';
    const annotation = extension.endsWith('ts') ? ": import('webpack').Configuration" : '';
    fs.writeFileSync(
      configFile,
      `const config${annotation} = ${config};\n${esm ? 'await Promise.resolve(); export default config;' : 'module.exports = config;'}`,
    );
    fs.writeFileSync(path.join(cwd, 'entry.js'), 'console.log("native webpack build");');
    const taskPath = path.resolve(__dirname, '../../../lib/tasks/webpackTask.js');
    const script = `require(${JSON.stringify(taskPath)}).webpackTask({ config: ${JSON.stringify(configFile)} })().catch(error => { console.error(error); process.exitCode = 1; });`;
    const nanoSpawn = (await import('nano-spawn')).default;
    const { stdout } = await nanoSpawn(process.execPath, ['-e', script], { cwd });
    expect(stdout).toContain('Running Webpack');
    expect(fs.existsSync(path.join(cwd, 'dist/bundle.js'))).toBe(true);
  });
});
