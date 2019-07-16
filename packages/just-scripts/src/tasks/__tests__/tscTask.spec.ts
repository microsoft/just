import mockfs from 'mock-fs';
import asyncDoneAsCallback from 'async-done';
import { resolve } from 'path';
import { promisify } from 'util';
import { encodeArgs, exec } from 'just-scripts-utils';
import { Arguments } from 'yargs';
import { logger, TaskFunction, TaskContext } from 'just-task';
import { tscTask } from '../tscTask';

const asyncDone = promisify(asyncDoneAsCallback);
const relativeRepoRoot = '../..';

// Jest will hoist these before the imports above, so these modules will be mocked first
jest.mock('just-scripts-utils/lib/exec', mockExecFactory);
jest.mock('just-task/lib/logger');

/**
 * Mock factory for the `just-scripts-utils/lib/exec` module. We don't want to really exec or spawn anything,
 * but we do want the rest of the exports to work.
 */
function mockExecFactory() {
  const originalModule = jest.requireActual('just-scripts-utils/lib/exec');
  return {
    // Use real implementation of exports except for `exec` and `spawn`
    ...originalModule,
    encodeArgs: jest
      .fn((cmdArgs: string[]) => {
        // Spy on encodeArgs, but keep its original implementation
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
function wrapTaskFunction(fn: TaskFunction, argv?: Arguments) {
  const argvOurs = argv || { _: [], $0: '' };
  const context: TaskContext = {
    argv: argvOurs,
    logger
  };
  const taskRet = (fn as any).call(context, (_err: any) => {});
  return taskRet;
}

/**
 * Call the task the way real code does.
 */
function callTaskForTest(fn: TaskFunction, argv?: Arguments) {
  return asyncDone(() => {
    return wrapTaskFunction(fn, argv);
  });
}

/**
 * Returns the composition of the `tsc.js` Node module in terms `mock-fs` understands, which is necessary for Node's
 * module loader to succeed.
 */
function mockFsTsc(relativeRootPathToNodeModules: string) {
  // Relative to cwd when the test runs
  const mockFsConfig: { [key: string]: any } = {};
  mockFsConfig[`${relativeRootPathToNodeModules}/node_modules/typescript/lib/tsc.js`] = 'a file';
  mockFsConfig[`${relativeRootPathToNodeModules}/node_modules/typescript/package.json`] = 'a file';
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
    mockfs.restore();
  });

  describe(`with empty options`, () => {
    describe(`and tsconfig.json at package root`, () => {
      it(`execs expected command`, () => {
        mockfs({
          ...mockFsTsc(relativeRepoRoot),
          'tsconfig.json': 'a file'
        });
        const task = tscTask({});
        expect.assertions(3);
        return callTaskForTest(task).then(() => {
          // Restore mockfs so snapshots work
          mockfs.restore();
          expect(exec).toHaveBeenCalled();
          // Inspect the call to `encodeArgs` since it is easier to strip out repo-specific path values.
          expect(encodeArgs).toHaveBeenCalled();
          const actualCmdArgs = normalizeCmdArgs((encodeArgs as jest.Mock<any>).mock.calls[0][0]);
          expect(actualCmdArgs).toMatchInlineSnapshot(`
            Array [
              "\${programFiles}/nodejs/node.exe",
              "\${repoRoot}/node_modules/typescript/lib/tsc.js",
              "--project",
              "\${packageRoot}/tsconfig.json",
            ]
          `);
        });
      });
    });

    describe(`and no tsconfig.json at package root`, () => {
      it(`does not exec command`, () => {
        mockfs({
          ...mockFsTsc(relativeRepoRoot)
        });
        const task = tscTask({});
        expect.assertions(1);
        return callTaskForTest(task).then(() => {
          expect(exec).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe(`where repo has TypeScript installed`, () => {
    it(`execs command`, () => {
      mockfs({
        ...mockFsTsc(relativeRepoRoot),
        'tsconfig.json': 'a file'
      });
      const task = tscTask({});
      expect.assertions(1);
      return callTaskForTest(task).then(() => {
        expect(exec).toHaveBeenCalled();
      });
    });
  });

  describe(`where package has TypeScript installed`, () => {
    it(`execs command`, () => {
      mockfs({
        ...mockFsTsc('.'),
        'tsconfig.json': 'a file'
      });
      const task = tscTask({});
      expect.assertions(1);
      return callTaskForTest(task).then(() => {
        expect(exec).toHaveBeenCalled();
      });
    });
  });

  describe(`where repo and package do not have TypeScript installed`, () => {
    it(`returns error`, () => {
      mockfs({
        'tsconfig.json': 'a file'
      });
      expect.assertions(1);
      expect(() => {
        tscTask({});
      }).toThrow('cannot find tsc');
    });
  });
});
