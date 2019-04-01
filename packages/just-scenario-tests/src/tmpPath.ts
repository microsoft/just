import path from 'path';
import os from 'os';
const ToolPrefix = 'just-scenario-tests';
export const tmpPath = path.join(os.tmpdir(), ToolPrefix);
