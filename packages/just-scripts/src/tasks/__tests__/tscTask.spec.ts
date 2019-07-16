import mockfs from 'mock-fs';
import { encodeArgs, exec } from 'just-scripts-utils';
import { tscTask } from '../tscTask';
import { callTaskForTest } from './callTaskForTest';
import { normalizeCmdArgsForTest } from './normalizeCmdArgsForTest';

const relativeRepoRoot = '../..';

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
function mockFsTsc(relativePath: string) {
  // Relative to cwd when the test runs
  const mockFsConfig: { [key: string]: any } = {};
  mockFsConfig[`${relativePath}/node_modules/typescript/lib/tsc.js`] = 'a file';
  mockFsConfig[`${relativePath}/node_modules/typescript/package.json`] = 'a file';
  return mockFsConfig;
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
          const actualCmdArgs = normalizeCmdArgsForTest((encodeArgs as jest.Mock<any>).mock.calls[0][0]);
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
