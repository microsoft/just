import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export const packageJson = fs.readFileSync(path.resolve(dirname, '../package.json'), 'utf-8');
