import { spawnSync, SpawnSyncReturns } from 'child_process';
import * as fse from 'fs-extra';
import * as path from 'path';
import * as tmp from 'tmp';

tmp.setGracefulCleanup();

const newNodeTest = Number(process.version.slice(1).split('.')[0]) >= 18 ? test : test.skip;

const justScriptsRoot = path.resolve(__dirname, '../..');
// const packageJson = require(path.join(justScriptsRoot, 'package.json')) as { bin: Record<string, string> };
// const oldCli = require.resolve('just-scripts/lib/cli');
// const newCli = require.resolve('just-scripts/lib/cli-esm');

// function getSpawnSyncError(params: { command: string; cwd: string; result: SpawnSyncReturns<string> }) {
//   const { command, cwd, result } = params;
//   return [`${command} failed in ${cwd}:`, 'stdout:', result.stdout, 'stderr:', result.stderr].join('\n\n');
// }

type FixtureOptions = {
  // configFile: string;
  packageName: string;
  configExt: string[];
  configContent: string;
  packageType?: 'module' | 'commonjs';
  nodeExecTask?: { filename: string; content: string };
  // configSyntax: 'import' | 'require';
  // nodeExecTask?: NodeExecTaskOptions & { filename: string; content: string };
  dependencies?: Record<string, string>;
};

const basicTestTask = `task('test', () => console.log('hello'));`;

const basicCjsConfig = `const { task } = require('just-scripts'); ${basicTestTask}`;
const basicEsmConfig = `import { task } from 'just-scripts'; ${basicTestTask}`;

const jsFixtures: Record<string, FixtureOptions> = {
  'CJS syntax config in CJS package': {
    packageName: 'cjs-config-in-cjs-package',
    configExt: ['.js', '.cjs'],
    configContent: basicCjsConfig,
  },
  'ESM syntax config in ESM package': {
    packageName: 'esm-config-in-esm-package',
    configExt: ['.js'],
    configContent: basicEsmConfig,
    packageType: 'module',
  },
  '.cjs config in ESM package': {
    packageName: 'cjs-config-in-esm-package',
    configExt: ['.cjs'],
    configContent: basicCjsConfig,
    packageType: 'module',
  },
  '.mjs config in CJS package': {
    packageName: 'mjs-config-in-cjs-package',
    configExt: ['.mjs'],
    configContent: basicEsmConfig,
  },
};

function createFixture(params: FixtureOptions) {
  const { configFile, configContent, nodeExecTask, packageType, dependencies } = params;

  const testFolderPath = tmp.dirSync({
    prefix: 'just-scripts-test-',
    // "Unsafe" means try to delete on exit even if it still contains files...which actually is
    // safe for purposes of most tests
    unsafeCleanup: true,
  }).name;

  process.chdir(testFolderPath);

  fse.writeJsonSync(path.join(testFolderPath, 'package.json'), {
    name: 'test',
    version: '1.0.0',
    dependencies,
    type: packageType,
  });

  fse.writeFileSync(path.join(testFolderPath, configFile), configContent);

  if (nodeExecTask) {
    fse.writeFileSync(path.join(testFolderPath, nodeExecTask.filename), nodeExecTask.content);
  }

  if (dependencies) {
    const yarnCmd = process.platform === 'win32' ? 'yarn.cmd' : 'yarn';
    const result = spawnSync(yarnCmd, { cwd: testFolderPath, encoding: 'utf8' });
    expect(result).toMatchObject({ status: 0 });
    // if (result.status !== 0) {
    //   throw new Error(getSpawnSyncError({ command: 'yarn', cwd: testFolderPath, result }));
    // }
  } else {
    fse.mkdirSync(path.join(testFolderPath, 'node_modules/.bin'), { recursive: true });
  }
  fse.symlinkSync(justScriptsRoot, path.join(testFolderPath, 'node_modules/just-scripts'));
  // for (const binName of Object.keys(packageJson.bin)) {
  //   fse.symlinkSync(
  //     path.join(justScriptsRoot, packageJson.bin[binName]),
  //     path.join(testFolderPath, 'node_modules/.bin', binName),
  //   );
  // }

  return testFolderPath;
}

function runCli(params: { args: string[]; cwd: string }) {
  const { cwd, args } = params;
  const result = spawnSync(process.execPath, args, { cwd, encoding: 'utf8' });
  const stderr = result.stderr
    .split('\n')
    // remove "Debugger attached" etc when debugging
    .filter(line => !line.toLowerCase().includes('debugger'))
    .join('\n');
  return { ...result, stderr };
}

describe.each([['cli'], ['cli-esm']])('%s', cliName => {
  const jsOnlyTest = cliName === 'cli-esm' ? test.skip : test;
  const cli = require.resolve('just-scripts/lib/' + cliName);

  let tmpdir = '';
  const cwd = process.cwd();

  afterEach(() => {
    process.chdir(cwd);
    fse.removeSync(tmpdir);
  });

  jsOnlyTest('JS config', () => {
    tmpdir = createFixture({
      configFile: 'just.config.js',
      configContent: `
        const { task } = require('just-scripts');
        task('test', () => console.log('hello'));`,
    });

    const result = runCli({ args: [cli, 'test'], cwd: tmpdir });
    expect(result).toMatchObject({
      status: 0,
      stdout: expect.stringContaining('hello'),
      stderr: '',
    });
  });
});
