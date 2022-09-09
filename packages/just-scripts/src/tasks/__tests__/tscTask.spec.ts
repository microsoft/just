import mockfs = require('mock-fs');
import { encodeArgs, exec, spawn } from 'just-scripts-utils';
import { TaskFunction } from 'just-task';
import { tscTask, tscWatchTask, TscTaskOptions } from '../tscTask';
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

interface Given {
  tscTaskFn: (options?: TscTaskOptions) => TaskFunction;
}

interface Expected {
  execOrSpawnSpy: jest.Mock<any>;
}

type TaskTestCase = [/* name */ string, Given, Expected];

describe(`tscTask`, () => {
  afterEach(() => {
    jest.clearAllMocks();
    mockfs.restore();
  });

  /**
   * Both `tscTask` and `tscWatchTask` should handle test cases similarly.
   */
  describe.each<TaskTestCase>([
    ['tscTask', { tscTaskFn: tscTask }, { execOrSpawnSpy: exec as jest.Mock<any> }],
    ['tscWatchTask', { tscTaskFn: tscWatchTask }, { execOrSpawnSpy: spawn as jest.Mock<any> }],
  ])(`using '%s' function`, (_name, given, expected) => {
    /**
     * Testing arguments treatment
     */
    describe(`testing arguments treatment`, () => {
      describe(`with no arguments`, () => {
        it(`execs command`, () => {
          mockfs({
            ...mockFsTsc(),
            'tsconfig.json': 'a file',
          });
          const task = given.tscTaskFn();
          expect.assertions(1);
          return callTaskForTest(task).then(() => {
            expect(expected.execOrSpawnSpy).toHaveBeenCalled();
          });
        });
      });

      describe(`with empty options`, () => {
        it(`execs command`, () => {
          mockfs({
            ...mockFsTsc(),
            'tsconfig.json': 'a file',
          });
          const givenOptions = {};
          const task = given.tscTaskFn(givenOptions);
          expect.assertions(1);
          return callTaskForTest(task).then(() => {
            expect(expected.execOrSpawnSpy).toHaveBeenCalled();
          });
        });
      });

      describe(`with some options`, () => {
        const givenOptions = { allowJs: true, outDir: 'some/out/path' };
        const expectedOptions = { ...givenOptions };

        beforeAll(() => {
          mockfs({
            ...mockFsTsc(),
            'tsconfig.json': 'a file',
          });
          const task = given.tscTaskFn(givenOptions);
          return callTaskForTest(task);
        });

        it(`execs command`, () => {
          expect(expected.execOrSpawnSpy).toHaveBeenCalled();
        });

        it(`treats options arg as immutable`, () => {
          expect(givenOptions).toEqual(expectedOptions);
        });
      });
    });

    /**
     * Testing various options and command output
     */
    describe(`with no arguments`, () => {
      it(`execs expected command`, () => {
        mockfs({
          ...mockFsTsc(),
          'tsconfig.json': 'a file',
        });
        const task = given.tscTaskFn();
        expect.assertions(3);
        return callTaskForTest(task).then(() => {
          // Restore mockfs so snapshots work
          mockfs.restore();
          expect(expected.execOrSpawnSpy).toHaveBeenCalled();
          // Inspect the call to `encodeArgs` since it is easier to strip out repo-specific path values.
          expect(encodeArgs).toHaveBeenCalled();
          const actualCmdArgs = normalizeCmdArgsForTest((encodeArgs as jest.Mock<any>).mock.calls[0][0]);
          expect(actualCmdArgs).toMatchSnapshot();
        });
      });
    });

    describe(`with empty options`, () => {
      it(`execs expected command`, () => {
        mockfs({
          ...mockFsTsc(),
          'tsconfig.json': 'a file',
        });
        const givenOptions = {};
        const task = given.tscTaskFn(givenOptions);
        expect.assertions(3);
        return callTaskForTest(task).then(() => {
          // Restore mockfs so snapshots work
          mockfs.restore();
          expect(expected.execOrSpawnSpy).toHaveBeenCalled();
          // Inspect the call to `encodeArgs` since it is easier to strip out repo-specific path values.
          expect(encodeArgs).toHaveBeenCalled();
          const actualCmdArgs = normalizeCmdArgsForTest((encodeArgs as jest.Mock<any>).mock.calls[0][0]);
          expect(actualCmdArgs).toMatchSnapshot();
        });
      });
    });

    describe(`with default options and tsconfig.json does not exist at package root`, () => {
      it(`does not exec command`, () => {
        mockfs({
          ...mockFsTsc(),
        });
        const task = given.tscTaskFn();
        expect.assertions(1);
        return callTaskForTest(task).then(() => {
          expect(expected.execOrSpawnSpy).not.toHaveBeenCalled();
        });
      });
    });

    describe(`with 'project' option where 'project' is custom path and tsconfig.json exists`, () => {
      it(`execs expected command`, () => {
        mockfs({
          ...mockFsTsc(),
          'a/custom/path': {
            'tsconfig.json': 'a file',
          },
        });
        const givenOptions = { project: 'a/custom/path/tsconfig.json' };
        const task = given.tscTaskFn(givenOptions);
        expect.assertions(3);
        return callTaskForTest(task).then(() => {
          // Restore mockfs so snapshots work
          mockfs.restore();
          expect(expected.execOrSpawnSpy).toHaveBeenCalled();
          // Inspect the call to `encodeArgs` since it is easier to strip out repo-specific path values.
          expect(encodeArgs).toHaveBeenCalled();
          const actualCmdArgs = normalizeCmdArgsForTest((encodeArgs as jest.Mock<any>).mock.calls[0][0]);
          expect(actualCmdArgs).toMatchSnapshot();
        });
      });
    });

    describe(`with 'project' option where 'project' is custom path and tsconfig.json does not exist`, () => {
      it(`does not exec command`, () => {
        mockfs({
          ...mockFsTsc(),
        });
        const givenOptions = { project: 'a/custom/path/tsconfig.json' };
        const task = given.tscTaskFn(givenOptions);
        expect.assertions(1);
        return callTaskForTest(task).then(() => {
          expect(expected.execOrSpawnSpy).not.toHaveBeenCalled();
        });
      });
    });

    describe(`with 'build' option where 'build' is custom path and tsconfig.json exists`, () => {
      it(`execs expected command`, () => {
        mockfs({
          ...mockFsTsc(),
          'a/custom/path': {
            'tsconfig.json': 'a file',
          },
        });
        const givenOptions = { build: 'a/custom/path/tsconfig.json' };
        const task = given.tscTaskFn(givenOptions);
        expect.assertions(3);
        return callTaskForTest(task).then(() => {
          // Restore mockfs so snapshots work
          mockfs.restore();
          expect(expected.execOrSpawnSpy).toHaveBeenCalled();
          // Inspect the call to `encodeArgs` since it is easier to strip out repo-specific path values.
          expect(encodeArgs).toHaveBeenCalled();
          const actualCmdArgs = normalizeCmdArgsForTest((encodeArgs as jest.Mock<any>).mock.calls[0][0]);
          expect(actualCmdArgs).toMatchSnapshot();
        });
      });
    });

    describe(`with 'build' option where 'build' is custom path and tsconfig.json does not exist`, () => {
      it(`does not exec command`, () => {
        mockfs({
          ...mockFsTsc(),
        });
        const givenOptions = { build: 'a/custom/path/tsconfig.json' };
        const task = given.tscTaskFn(givenOptions);
        expect.assertions(1);
        return callTaskForTest(task).then(() => {
          expect(expected.execOrSpawnSpy).not.toHaveBeenCalled();
        });
      });
    });

    describe(`with 'build' option where 'build' is multiple paths and they all exist`, () => {
      it(`execs expected command`, () => {
        mockfs({
          ...mockFsTsc(),
          'project/a': {
            'tsconfig.json': 'a file',
          },
          'project/b': {
            'tsconfig.json': 'a file',
          },
          'project/c': {
            'tsconfig.json': 'a file',
          },
        });
        const givenOptions = {
          build: ['project/a/tsconfig.json', 'project/b/tsconfig.json', 'project/c/tsconfig.json'],
        };
        const task = given.tscTaskFn(givenOptions);
        expect.assertions(3);
        return callTaskForTest(task).then(() => {
          // Restore mockfs so snapshots work
          mockfs.restore();
          expect(expected.execOrSpawnSpy).toHaveBeenCalled();
          // Inspect the call to `encodeArgs` since it is easier to strip out repo-specific path values.
          expect(encodeArgs).toHaveBeenCalled();
          const actualCmdArgs = normalizeCmdArgsForTest((encodeArgs as jest.Mock<any>).mock.calls[0][0]);
          expect(actualCmdArgs).toMatchSnapshot();
        });
      });
    });

    describe(`with 'build' option where 'build' is multiple paths and some do not exist`, () => {
      it(`does not exec command`, () => {
        mockfs({
          ...mockFsTsc(),
          'project/a': {
            'tsconfig.json': 'a file',
          },
        });
        const givenOptions = {
          build: ['project/a/tsconfig.json', 'project/b/tsconfig.json', 'project/c/tsconfig.json'],
        };
        const task = given.tscTaskFn(givenOptions);
        expect.assertions(1);
        return callTaskForTest(task).then(() => {
          expect(expected.execOrSpawnSpy).not.toHaveBeenCalled();
        });
      });
    });

    describe(`with string value option`, () => {
      it(`execs expected command`, () => {
        mockfs({
          ...mockFsTsc(),
          'tsconfig.json': 'a file',
        });
        const givenOptions = { module: 'ESNext' };
        const task = given.tscTaskFn(givenOptions);
        expect.assertions(3);
        return callTaskForTest(task).then(() => {
          // Restore mockfs so snapshots work
          mockfs.restore();
          expect(expected.execOrSpawnSpy).toHaveBeenCalled();
          // Inspect the call to `encodeArgs` since it is easier to strip out repo-specific path values.
          expect(encodeArgs).toHaveBeenCalled();
          const actualCmdArgs = normalizeCmdArgsForTest((encodeArgs as jest.Mock<any>).mock.calls[0][0]);
          expect(actualCmdArgs).toMatchSnapshot();
        });
      });
    });

    describe(`with string array option`, () => {
      it(`execs expected command`, () => {
        mockfs({
          ...mockFsTsc(),
          'tsconfig.json': 'a file',
        });
        const givenOptions = { lib: ['es6', 'dom', 'esnext.intl'] };
        const task = given.tscTaskFn(givenOptions);
        expect.assertions(3);
        return callTaskForTest(task).then(() => {
          // Restore mockfs so snapshots work
          mockfs.restore();
          expect(expected.execOrSpawnSpy).toHaveBeenCalled();
          // Inspect the call to `encodeArgs` since it is easier to strip out repo-specific path values.
          expect(encodeArgs).toHaveBeenCalled();
          const actualCmdArgs = normalizeCmdArgsForTest((encodeArgs as jest.Mock<any>).mock.calls[0][0]);
          expect(actualCmdArgs).toMatchSnapshot();
        });
      });
    });

    describe(`with a boolean 'true' switch`, () => {
      it(`execs expected command`, () => {
        mockfs({
          ...mockFsTsc(),
          'tsconfig.json': 'a file',
        });
        const givenOptions = { allowJs: true };
        const task = given.tscTaskFn(givenOptions);
        expect.assertions(3);
        return callTaskForTest(task).then(() => {
          // Restore mockfs so snapshots work
          mockfs.restore();
          expect(expected.execOrSpawnSpy).toHaveBeenCalled();
          // Inspect the call to `encodeArgs` since it is easier to strip out repo-specific path values.
          expect(encodeArgs).toHaveBeenCalled();
          const actualCmdArgs = normalizeCmdArgsForTest((encodeArgs as jest.Mock<any>).mock.calls[0][0]);
          expect(actualCmdArgs).toMatchSnapshot();
        });
      });
    });

    describe(`with a boolean 'false' switch`, () => {
      it(`execs expected command`, () => {
        mockfs({
          ...mockFsTsc(),
          'tsconfig.json': 'a file',
        });
        const givenOptions = { allowJs: false };
        const task = given.tscTaskFn(givenOptions);
        expect.assertions(3);
        return callTaskForTest(task).then(() => {
          // Restore mockfs so snapshots work
          mockfs.restore();
          expect(expected.execOrSpawnSpy).toHaveBeenCalled();
          // Inspect the call to `encodeArgs` since it is easier to strip out repo-specific path values.
          expect(encodeArgs).toHaveBeenCalled();
          const actualCmdArgs = normalizeCmdArgsForTest((encodeArgs as jest.Mock<any>).mock.calls[0][0]);
          expect(actualCmdArgs).toMatchSnapshot();
        });
      });
    });

    describe(`with a combination of switches`, () => {
      it(`execs expected command`, () => {
        mockfs({
          ...mockFsTsc(),
          'tsconfig.json': 'a file',
        });
        const givenOptions = { allowJs: true, build: 'tsconfig.json', outDir: 'some/out/path' };
        const task = given.tscTaskFn(givenOptions);
        expect.assertions(3);
        return callTaskForTest(task).then(() => {
          // Restore mockfs so snapshots work
          mockfs.restore();
          expect(expected.execOrSpawnSpy).toHaveBeenCalled();
          // Inspect the call to `encodeArgs` since it is easier to strip out repo-specific path values.
          expect(encodeArgs).toHaveBeenCalled();
          const actualCmdArgs = normalizeCmdArgsForTest((encodeArgs as jest.Mock<any>).mock.calls[0][0]);
          expect(actualCmdArgs).toMatchSnapshot();
        });
      });
    });

    /**
     * Testing repo layout
     */
    describe(`testing repo layout`, () => {
      describe(`where repo has TypeScript installed`, () => {
        it(`execs command`, () => {
          mockfs({
            ...mockFsTsc(),
            'tsconfig.json': 'a file',
          });
          const task = given.tscTaskFn();
          expect.assertions(1);
          return callTaskForTest(task).then(() => {
            expect(expected.execOrSpawnSpy).toHaveBeenCalled();
          });
        });
      });

      describe(`where package has TypeScript installed`, () => {
        it(`execs command`, () => {
          mockfs({
            ...mockFsTsc('.'),
            'tsconfig.json': 'a file',
          });
          const task = given.tscTaskFn();
          expect.assertions(1);
          return callTaskForTest(task).then(() => {
            expect(expected.execOrSpawnSpy).toHaveBeenCalled();
          });
        });
      });

      describe(`where repo and package do not have TypeScript installed`, () => {
        it(`returns error`, () => {
          mockfs({
            'tsconfig.json': 'a file',
          });
          expect.assertions(1);
          expect(() => {
            given.tscTaskFn();
          }).toThrow('cannot find tsc');
        });
      });
    });
  });
});
