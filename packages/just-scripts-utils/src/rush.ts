import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import jju from 'jju';

/**
 * Runs rush update.
 * @param cwd Working directory in which to run the command.
 */
export function rushUpdate(cwd: string): void {
  execSync(`${process.execPath} common/scripts/install-run-rush.js update`, { cwd, stdio: 'inherit' });
}

/**
 * Reads the contents of rush.json (using a parser which handles comments).
 * @param rootPath Path to the folder containing rush.json.
 * @returns The parsed contents of rush.json.
 */
export function readRushJson(rootPath: string): any {
  const rushJsonFile = path.join(rootPath, 'rush.json');
  // TODO: handle if file doesn't exist

  const contents = fs.readFileSync(rushJsonFile, 'utf8').toString();
  return jju.parse(contents);

}

/**
 * Adds a package to the projects list in rush.json.
 * @param packageName Name of the new package. Assumed to be located under `packages/${packageName}`.
 * @param rootPath Path to the folder containing rush.json.
 */
export function rushAddPackage(packageName: string, rootPath: string): void {
  const rushJsonFile = path.join(rootPath, 'rush.json');
  // TODO: handle if file doesn't exist

  const oldContents = fs.readFileSync(rushJsonFile, 'utf8').toString();
  // rush.json can contain comments, so we have to use a json library which supports comments
  // (instead of JSON.parse/JSON.stringify)
  const rushJson = jju.parse(oldContents);
  rushJson.projects.push({
    packageName,
    projectFolder: `packages/${packageName}`
  });

  const newContents = jju.update(oldContents, rushJson, {
    mode: 'cjson',
    indent: 2
  });
  fs.writeFileSync(rushJsonFile, newContents);
}
