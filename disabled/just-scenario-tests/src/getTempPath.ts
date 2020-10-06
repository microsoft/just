import * as path from 'path';
import * as os from 'os';
const ToolPrefix = 'just-scenario-tests';
export const getTempPath = (scenario: string) => path.join(os.tmpdir(), ToolPrefix, scenario);
