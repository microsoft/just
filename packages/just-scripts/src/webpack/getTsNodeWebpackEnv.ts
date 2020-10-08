export function getTsNodeWebpackEnv(configPath: string, tsconfig?: string, transpileOnly?: boolean) {
  const env: { [key: string]: string | undefined } = {};

  if (tsconfig) {
    env.TS_NODE_PROJECT = tsconfig;
  } else {
    env.TS_NODE_COMPILER_OPTIONS = JSON.stringify({ module: 'commonjs', target: 'es2017', moduleResolution: 'node' });
  }

  if (configPath.endsWith('.ts') && transpileOnly !== false) {
    env.TS_NODE_TRANSPILE_ONLY = 'true';
  }

  return env;
}
