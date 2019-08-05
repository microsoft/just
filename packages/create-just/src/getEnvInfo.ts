import envinfo from 'envinfo';
import os from 'os';

let envInfoCache: { Binaries: { Yarn: any; npm: any } };

export const getEnvInfo = () => {
  return envInfoCache;
};

export const initialize = async () => {
  envInfoCache = JSON.parse(
    await envinfo.run(
      {
        Binaries: ['Yarn', 'npm']
      },
      { json: true, showNotFound: true }
    )
  );

  envInfoCache.Binaries.Yarn.path = envInfoCache.Binaries.Yarn && expandHome(envInfoCache.Binaries.Yarn.path);
  envInfoCache.Binaries.npm.path = envInfoCache.Binaries.npm && expandHome(envInfoCache.Binaries.npm.path);

  return envInfoCache;
};

function expandHome(path: string) {
  if (path.startsWith('~/')) {
    return path.replace('~/', os.homedir() + '/');
  }

  return path;
}
