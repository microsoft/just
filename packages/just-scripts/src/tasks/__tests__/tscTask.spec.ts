import mockfs from 'mock-fs';
import { encodeArgs, exec } from 'just-scripts-utils';
import { TaskFunction } from 'just-task';
import { tscTask, TscTaskOptions } from '../tscTask';
import { callTaskForTest } from './callTaskForTest';
import { normalizeCmdArgsForTest } from './normalizeCmdArgsForTest';

// Jest will hoist these before the imports above, so these modules will be mocked first
jest.mock('just-scripts-utils/lib/exec', () => {
  const { mockExecFactory } = require('./mockExecFactory');
  return mockExecFactory();
});
jest.mock('just-task/lib/logger');

/**
 * Returns the composition of the `tsc.js` Node module in terms `mock-fs` understands, which is necessary for Node's
 * module loader to succeed.
 */
function mockFsTsc(relativePath?: string) {
  // Relative to cwd when the test runs
  const relativeRepoRoot = '../..';
  const ourRelativePath = relativePath || relativeRepoRoot;

  const mockFsConfig: { [key: string]: any } = {};
  mockFsConfig[`${ourRelativePath}/node_modules/typescript/lib/tsc.js`] = 'a file';
  mockFsConfig[`${ourRelativePath}/node_modules/typescript/package.json`] = 'a file';
  return mockFsConfig;
}

type TaskTestCase = [/* name */ string, /* TSC task function */ (options: TscTaskOptions) => TaskFunction];

describe(`tscTask`, () => {
  afterEach(() => {
    jest.clearAllMocks();
    mockfs.restore();
  });

  /**
   * Both `tscTask` and `tscWatchTask` should handle test cases similarly.
   */
  describe.each<TaskTestCase>([['tscTask', tscTask] /*,
    ['tscWatchTask', tscWatchTask] */])(
    `using '%s' function`,
    (_name, tscTaskFn) => {
      describe(`with empty options`, () => {
        describe(`and tsconfig.json exists at package root`, () => {
          it(`execs expected command`, () => {
            mockfs({
              ...mockFsTsc(),
              'tsconfig.json': 'a file'
            });
            const task = tscTaskFn({});
            expect.assertions(3);
            return callTaskForTest(task).then(() => {
              // Restore mockfs so snapshots work
              mockfs.restore();
              expect(exec).toHaveBeenCalled();
              // Inspect the call to `encodeArgs` since it is easier to strip out repo-specific path values.
              expect(encodeArgs).toHaveBeenCalled();
              const actualCmdArgs = normalizeCmdArgsForTest((encodeArgs as jest.Mock<any>).mock.calls[0][0]);
              expect(actualCmdArgs).toMatchSnapshot();
            });
          });
        });

        describe(`and tsconfig.json does not exist at package root`, () => {
          it(`does not exec command`, () => {
            mockfs({
              ...mockFsTsc()
            });
            const task = tscTaskFn({});
            expect.assertions(1);
            return callTaskForTest(task).then(() => {
              expect(exec).not.toHaveBeenCalled();
            });
          });
        });
      });

      describe(`using 'project' option`, () => {
        describe(`where 'project' is custom path`, () => {
          describe(`and tsconfig.json exists`, () => {
            it(`execs expected command`, () => {
              mockfs({
                ...mockFsTsc(),
                'a/custom/path': {
                  'tsconfig.json': 'a file'
                }
              });
              const task = tscTaskFn({ project: 'a/custom/path/tsconfig.json' });
              expect.assertions(3);
              return callTaskForTest(task).then(() => {
                // Restore mockfs so snapshots work
                mockfs.restore();
                expect(exec).toHaveBeenCalled();
                // Inspect the call to `encodeArgs` since it is easier to strip out repo-specific path values.
                expect(encodeArgs).toHaveBeenCalled();
                const actualCmdArgs = normalizeCmdArgsForTest((encodeArgs as jest.Mock<any>).mock.calls[0][0]);
                expect(actualCmdArgs).toMatchSnapshot();
              });
            });
          });

          describe(`and tsconfig.json does not exist`, () => {
            it(`does not exec command`, () => {
              mockfs({
                ...mockFsTsc()
              });
              const task = tscTaskFn({ project: 'a/custom/path/tsconfig.json' });
              expect.assertions(1);
              return callTaskForTest(task).then(() => {
                expect(exec).not.toHaveBeenCalled();
              });
            });
          });
        });
      });

      describe(`using 'build' option`, () => {
        describe(`where 'build' is custom path`, () => {
          describe(`and tsconfig.json exists`, () => {
            it(`execs expected command`, () => {
              mockfs({
                ...mockFsTsc(),
                'a/custom/path': {
                  'tsconfig.json': 'a file'
                }
              });
              const task = tscTaskFn({ build: 'a/custom/path/tsconfig.json' });
              expect.assertions(3);
              return callTaskForTest(task).then(() => {
                // Restore mockfs so snapshots work
                mockfs.restore();
                expect(exec).toHaveBeenCalled();
                // Inspect the call to `encodeArgs` since it is easier to strip out repo-specific path values.
                expect(encodeArgs).toHaveBeenCalled();
                const actualCmdArgs = normalizeCmdArgsForTest((encodeArgs as jest.Mock<any>).mock.calls[0][0]);
                expect(actualCmdArgs).toMatchSnapshot();
              });
            });
          });

          describe(`and tsconfig.json does not exist`, () => {
            it(`does not exec command`, () => {
              mockfs({
                ...mockFsTsc()
              });
              const task = tscTaskFn({ project: 'a/custom/path/tsconfig.json' });
              expect.assertions(1);
              return callTaskForTest(task).then(() => {
                expect(exec).not.toHaveBeenCalled();
              });
            });
          });
        });
      });

      describe(`using a boolean switch`, () => {
        it(`execs expected command`, () => {
          mockfs({
            ...mockFsTsc(),
            'tsconfig.json': 'a file'
          });
          const task = tscTaskFn({ allowJs: true });
          expect.assertions(3);
          return callTaskForTest(task).then(() => {
            // Restore mockfs so snapshots work
            mockfs.restore();
            expect(exec).toHaveBeenCalled();
            // Inspect the call to `encodeArgs` since it is easier to strip out repo-specific path values.
            expect(encodeArgs).toHaveBeenCalled();
            const actualCmdArgs = normalizeCmdArgsForTest((encodeArgs as jest.Mock<any>).mock.calls[0][0]);
            expect(actualCmdArgs).toMatchSnapshot();
          });
        });
      });

      describe(`using a combination of switches`, () => {
        it(`execs expected command`, () => {
          mockfs({
            ...mockFsTsc(),
            'tsconfig.json': 'a file'
          });
          const task = tscTaskFn({ allowJs: true, build: 'tsconfig.json', outDir: 'some/out/path' });
          expect.assertions(3);
          return callTaskForTest(task).then(() => {
            // Restore mockfs so snapshots work
            mockfs.restore();
            expect(exec).toHaveBeenCalled();
            // Inspect the call to `encodeArgs` since it is easier to strip out repo-specific path values.
            expect(encodeArgs).toHaveBeenCalled();
            const actualCmdArgs = normalizeCmdArgsForTest((encodeArgs as jest.Mock<any>).mock.calls[0][0]);
            expect(actualCmdArgs).toMatchSnapshot();
          });
        });
      });

      describe(`where repo has TypeScript installed`, () => {
        it(`execs command`, () => {
          mockfs({
            ...mockFsTsc(),
            'tsconfig.json': 'a file'
          });
          const task = tscTaskFn({});
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
          const task = tscTaskFn({});
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
            tscTaskFn({});
          }).toThrow('cannot find tsc');
        });
      });
    }
  );
});
