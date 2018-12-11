import { logger, resolveCwd, resolve } from 'just-task';
import { spawn } from 'child_process';
import chalk from 'chalk';
import parallelLimit from 'run-parallel-limit';
import path from 'path';
import fs from 'fs';
import os from 'os';
import semver from 'semver';

export interface IOutdatedOptions {
  versionSpec?: VersionSpec;
}

interface VersionSpec {
  [name: string]: string;
}

interface VersionInfo {
  [name: string]: { versions: string[]; tags: { [tag: string]: string } };
}

function fetchVersions(versionSpec: VersionSpec): Promise<VersionInfo> {
  const versionInfo: VersionInfo = {};

  return new Promise((resolve, reject) => {
    const checkVersionTasks = Object.keys(versionSpec!).map(
      name =>
        function(cb: any) {
          const npmCmd = `${path.dirname(process.execPath)}/npm${os.platform() === 'win32' ? '.cmd' : ''}`;
          const npmArgs = ['info', '--json', name];
          const cp = spawn(npmCmd, npmArgs, { stdio: 'pipe' });
          let json = '';

          cp.stdout.on('data', (data: any) => {
            json = json + data.toString();
          });

          cp.on('exit', code => {
            const info = JSON.parse(json);
            versionInfo[name] = { tags: info['dist-tags'], versions: info['versions'] };
            cb();
          });
        }
    );

    parallelLimit(checkVersionTasks, 5, () => {
      resolve(versionInfo);
    });
  });
}

function getUpdateVersions(versionSpec: VersionSpec, versionInfo: VersionInfo) {
  const keepUpdated: VersionSpec = {};

  Object.keys(versionInfo).forEach(name => {
    const spec = versionSpec[name];
    const info = versionInfo[name];

    let updateVersion: string | undefined;

    if (semver.valid(spec)) {
      updateVersion = semver.maxSatisfying(info.versions, spec);
    } else {
      updateVersion = info.tags[spec] || info.tags.latest;
    }

    let packageJsonVersion = '';

    const resolved = resolveCwd(`${name}/package.json`);
    if (resolved) {
      packageJsonVersion = JSON.parse(fs.readFileSync(resolved).toString()).version;
    }

    if (updateVersion && updateVersion !== packageJsonVersion) {
      keepUpdated[name] = updateVersion;
    }
  });

  return keepUpdated;
}

export function outdatedTask(outdatedOptions: IOutdatedOptions = {}) {
  const options: IOutdatedOptions = {
    versionSpec: { 'just-task': 'latest', 'just-task-preset': 'latest' },
    ...outdatedOptions
  };
  return async function outdated() {
    logger.info(`Fetching Outdated Dependency Versions`);

    if (options.versionSpec) {
      const versionInfo = await fetchVersions(options.versionSpec);
      const updateVersions = getUpdateVersions(options.versionSpec, versionInfo);

      if (Object.keys(updateVersions).length > 0) {
        Object.keys(updateVersions).forEach(name => {
          logger.info(`  ${chalk.cyan(name)} needs to be updated to '${chalk.yellow(updateVersions[name])}'`);
        });
      } else {
        logger.info('All dependencies are up-to-date');
      }
    }
  };
}

function getPackageVersionSpec(original: string, updated: string) {
  let matched = original.match(/^(>=|>|\^|~)/);

  if (matched) {
    return `${matched[1]}${updated}`;
  } else {
    return updated;
  }
}

export function selfUpdateTask(outdatedOptions: IOutdatedOptions = {}) {
  const options: IOutdatedOptions = {
    versionSpec: { 'just-task': 'latest', 'just-task-preset': 'latest' },
    ...outdatedOptions
  };
  return async function outdated() {
    logger.info(`Fetching Outdated Dependency Versions`);

    if (options.versionSpec) {
      const versionInfo = await fetchVersions(options.versionSpec);
      const updateVersions = getUpdateVersions(options.versionSpec, versionInfo);
      const packageJsonFile = resolve('./package.json');

      if (packageJsonFile) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonFile).toString());

        if (Object.keys(updateVersions).length > 0) {
          Object.keys(updateVersions).forEach(name => {
            if (packageJson.devDependencies && packageJson.devDependencies[name]) {
              packageJson.devDependencies[name] = getPackageVersionSpec(packageJson.devDependencies[name], updateVersions[name]);
              logger.info(`  ${chalk.cyan(name)} updated to '${chalk.yellow(updateVersions[name])}' (devDependencies)`);
            } else {
              packageJson.dependencies = packageJson.dependencies || {};

              if (packageJson.dependencies[name] !== updateVersions[name]) {
                packageJson.dependencies[name] = getPackageVersionSpec(packageJson.dependencies[name], updateVersions[name]);
                logger.info(`  ${chalk.cyan(name)} updated to '${chalk.yellow(updateVersions[name])}'`);
              }
            }
          });

          fs.writeFileSync(packageJsonFile, JSON.stringify(packageJson, null, 2));
        } else {
          logger.info('All dependencies are up-to-date');
        }
      } else {
        throw new Error('Cannot find package.json to be updated');
      }
    }
  };
}
