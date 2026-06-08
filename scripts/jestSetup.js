// @ts-check
const { jest, afterAll } = require('@jest/globals');

// Safety net: production code should never call process.exit() directly
// (errors should be thrown and caught at the top level in cli.ts).
// This mock ensures any accidental process.exit() call in tests immediately
// throws rather than silently exiting the test runner.
jest.spyOn(process, 'exit').mockImplementation(code => {
  throw new Error(`process.exit called with code ${code}`);
});

afterAll(() => {
  jest.restoreAllMocks();
});
