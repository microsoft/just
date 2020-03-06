import { PackageEntries } from '../interfaces/packageInfoTypes';
import { getPackageInfo } from '../packageInfo';
import { getRepoPackagesFromSerializableForm, getSerializableRepoPackages } from '../internal/packageInfoCache';
import { findGitRoot } from '../repoInfo';
import { normalizePath } from '../normalizePath';

const _rootPath = normalizePath(findGitRoot());

function trimPath(rootPath: string, fullPath: string): string {
  const index = fullPath.indexOf(rootPath);
  return index >= 0 ? fullPath.substr(index + rootPath.length) : fullPath;
}

/**
 * create a version of PackageEntries that does not have config loaders so that they can be compared cleanly
 * @param entries - entries to create a comparable copy of
 */
function comparableEntries(entries: PackageEntries): PackageEntries {
  return Object.assign(
    {},
    ...Object.keys(entries)
      .sort()
      .map(name => {
        const entry = entries[name];
        return {
          [name]: {
            path: trimPath(_rootPath, entry.path),
            dependencies: Object.assign(
              {},
              Object.keys(entry.dependencies).map(name => ({ [name]: {} }))
            )
          }
        };
      })
  );
}

describe('packageInfo', () => {
  test('load with no-cache', () => {
    const info = getPackageInfo({ strategy: 'no-cache' });
    Object.keys(info.entries).forEach(name => {
      const entry = info.entries[name];
      const config = entry.getConfig();
      expect(config.name).toEqual(name);
    });
  });

  test('load with cache', () => {
    const info = getPackageInfo({ strategy: 'normal' });
    Object.keys(info.entries).forEach(name => {
      const entry = info.entries[name];
      const config = entry.getConfig();
      expect(config.name).toEqual(name);
    });
  });

  test('serialize and back are equivalent', () => {
    const info = getPackageInfo();
    const serializedForm = getSerializableRepoPackages(info.entries);
    const unserializedEntries = getRepoPackagesFromSerializableForm(serializedForm);
    const reserializedForm = getSerializableRepoPackages(unserializedEntries);
    expect(serializedForm).toEqual(reserializedForm);
    expect(comparableEntries(info.entries)).toEqual(comparableEntries(unserializedEntries));
  });

  test('cached and non-cached are equivalent', () => {
    const infoCached = getPackageInfo();
    const infoDirect = getPackageInfo({ strategy: 'no-cache' });
    expect(comparableEntries(infoCached.entries)).toEqual(comparableEntries(infoDirect.entries));
  });

  test('paths', () => {
    const paths = getPackageInfo()
      .paths()
      .map(path => trimPath(_rootPath, path));
    expect(paths).toMatchSnapshot();
  });

  test('names', () => {
    const names = getPackageInfo().names();
    expect(names).toMatchSnapshot();
  });

  test('info matches snapshot', () => {
    const info = getPackageInfo();
    expect(comparableEntries(info.entries)).toMatchSnapshot();
  });
});
