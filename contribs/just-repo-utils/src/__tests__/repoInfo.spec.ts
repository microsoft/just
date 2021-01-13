import { findGitRoot, getRepoInfo } from '../repoInfo';

describe('findGitRoot', () => {
  test('find git root exists', () => {
    expect(findGitRoot()).toBeTruthy();
  });

  test('findGitRoot callback basic', () => {
    let count = 0;
    const paths: string[] = [];
    const root = findGitRoot((cur) => {
      count++;
      paths.push(cur);
    });
    expect(count).toBeGreaterThan(0);
    expect(paths.length).toEqual(count);
    expect(root).toEqual(paths[paths.length - 1]);
  });

  test('findGitRoot callback cancels correctly', () => {
    const paths: string[] = [];
    findGitRoot((cur) => {
      paths.push(cur);
    });
    for (let i = 0; i < paths.length; i++) {
      let count = 0;
      const stopPt = findGitRoot((_cur) => {
        return count++ === i;
      });
      expect(stopPt).toEqual(paths[i]);
      expect(count).toEqual(i + 1);
    }
  });
});

describe('repoInfo', () => {
  test('repoInfo includes the correct root', () => {
    const root = findGitRoot();
    expect(getRepoInfo().rootPath).toEqual(root);
  });

  test('repo info finds monorepo info', () => {
    const info = getRepoInfo();
    expect(info.monorepo).toEqual('lerna');
    expect(info.getLernaJson).toBeDefined();
    expect(info.getRushJson).toBeUndefined();
    expect(info.getPackageJson).toBeDefined();
  });

  test('repoInfo can load lerna config', () => {
    expect(getRepoInfo().getLernaJson!().packages).toBeDefined();
  });

  test('repoInfo can load root package json', () => {
    expect(getRepoInfo().getPackageJson().name).toEqual('just-repo');
  });
});
