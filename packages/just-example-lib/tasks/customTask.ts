import * as path from 'path';
import * as fs from 'fs';
export const packageJson = fs.readFileSync(path.join(import.meta.dirname, '../package.json'), 'utf-8');
