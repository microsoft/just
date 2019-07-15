import mockfs from 'mock-fs';
import { resolve } from 'path';
import { encodeArgs } from 'just-scripts-utils';
import { Arguments } from 'yargs';
import { logger, TaskFunction, TaskContext } from 'just-task';
import { tscTask } from '../tscTask';

// Jest will hoist these before the imports above, so these modules will be mocked first
jest.mock('just-scripts-utils/lib/exec', mockExecFactory);
jest.mock('just-task/lib/logger');

/**
 * Mock factory for the `just-scripts-utils/lib/exec` module.
 */
function mockExecFactory() {
  const originalModule = jest.requireActual('just-scripts-utils/lib/exec');
  return {
    // Use real implementation of exports except for `exec` and `spawn`
    ...originalModule,
    encodeArgs: jest
      .fn((cmdArgs: string[]) => {
        return originalModule.encodeArgs(cmdArgs);
      })
      .mockName('encodeArgs'),
    exec: jest
      .fn(() => {
        // Don't exec in real life
        return Promise.resolve();
      })
      .mockName('exec'),
    spawn: jest
      .fn(() => {
        // Don't spawn in real life
        return Promise.resolve();
      })
      .mockName('spawn')
  };
}

/**
 * Wrapper to call task function for the test.
 */
function callTaskFunction(fn: TaskFunction, argv?: Arguments) {
  const argvOurs = argv || { _: [], $0: '' };
  const context: TaskContext = {
    argv: argvOurs,
    logger
  };
  const taskRet = (fn as any).call(context, (_err: any) => {});
  return Promise.resolve(taskRet);
}

/**
 * Returns the composition of the `tsc.js` Node module in `mock-fs` terms necessary for Node's
 * module loader to succeed.
 */
function mockFsTsc() {
  // Relative to cwd when the test runs
  const relativeRepoRoot = '../..';
  const mockFsConfig: { [key: string]: any } = {};
  mockFsConfig[`${relativeRepoRoot}/node_modules/typescript/lib/tsc.js`] = 'a file';
  mockFsConfig[`${relativeRepoRoot}/node_modules/typescript/package.json`] = 'a file';
  return mockFsConfig;
}

/**
 * Normalizes paths in cmd args so test comparisons work no matter the machine it runs on.
 */
function normalizeCmdArgs(cmdArgs: string[]) {
  const packageRootDir = process.cwd();
  const repoRootDir = resolve(packageRootDir, '../..');
  const programFilesDir = process.env['ProgramFiles'];

  if (!cmdArgs) {
    return cmdArgs;
  }

  return cmdArgs.map(arg => {
    let newArg = undefined;
    if (programFilesDir && arg.indexOf(programFilesDir) >= 0) {
      newArg = arg.replace(programFilesDir, '${programFiles}');
    } else if (arg.indexOf(packageRootDir) >= 0) {
      newArg = arg.replace(packageRootDir, '${packageRoot}');
    } else if (arg.indexOf(repoRootDir) >= 0) {
      newArg = arg.replace(repoRootDir, '${repoRoot}');
    }
    if (newArg) {
      // Convert backslashes to forward slashes
      return newArg.replace(/\\/g, '/');
    }
    return arg;
  });
}

describe(`tscTask`, () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe(`with tsconfig.json and no options`, () => {
    it(`execs expected command line`, () => {
      mockfs({
        ...mockFsTsc(),
        'tsconfig.json': 'a file'
      });
      const task = tscTask({});
      expect.assertions(3);
      return callTaskFunction(task).then(() => {
        // Restore mockfs so snapshots work
        mockfs.restore();
        // Inspect the call to `encodeArgs` since it is easier to strip out repo-specific path values.
        expect(encodeArgs).toHaveBeenCalled();
        const encodeArgsSpy = encodeArgs as jest.Mock<any>;
        expect(encodeArgsSpy).toHaveBeenCalled();
        const actualCmdArgs = normalizeCmdArgs(encodeArgsSpy.mock.calls[0][0]);
        expect(actualCmdArgs).toMatchSnapshot();
      });
    });
  });
});
