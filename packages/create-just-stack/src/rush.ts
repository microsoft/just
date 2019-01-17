import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import json from 'json5';

export function update(cwd: string) {
  return execSync(`${process.execPath} common/scripts/install-run-rush.js update`, { cwd, stdio: 'inherit' });
}

export function addPackage(packageName: string, installPath: string) {
  const rushJsonFile = path.join(installPath, 'rush.json');
  const rushJson = json.parse(fs.readFileSync(rushJsonFile).toString());

  rushJson.projects.push({
    packageName,
    projectFolder: `packages/${packageName}`,
    reviewCategory: 'production'
  });

  fs.writeFileSync(rushJsonFile, JSON.stringify(rushJson, null, 2));
}
