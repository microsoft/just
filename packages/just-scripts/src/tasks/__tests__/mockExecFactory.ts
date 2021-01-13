/**
 * Mock factory for the `just-scripts-utils/lib/exec` module. We don't want to really exec or spawn anything,
 * but we do want the rest of the exports to work.
 */
export function mockExecFactory() {
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
      .mockName('spawn'),
  };
}
