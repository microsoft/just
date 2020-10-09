import * as path from 'path';
import * as fs from 'fs';
export const packageJson = fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8');
