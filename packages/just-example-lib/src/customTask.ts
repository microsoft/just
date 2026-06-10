import path from 'path';
import fs from 'fs';
export const packageJson = fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf-8');
