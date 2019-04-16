import path from 'path';
import os from 'os';
const ToolPrefix = 'just-scenario-tests';
export const getTempPath = (scenario: string) => path.join(os.tmpdir(), ToolPrefix, scenario);
