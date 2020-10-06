export function getTsNodeWebpackEnv(configPath: string, tsconfig?: string, transpileOnly?: boolean) {
  const env: { [key: string]: string | undefined } = {};
  if (tsconfig) {
    env.TS_NODE_PROJECT = tsconfig;
  }
  if (configPath.endsWith('.ts') && transpileOnly !== false) {
    env.TS_NODE_TRANSPILE_ONLY = 'true';
  }

  return env;
}
