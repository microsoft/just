// @ts-check

/** @typedef {import('lage').ConfigOptions} ConfigOptions */
/** @typedef {import('lage').CacheOptions} CacheOptions */

/**
 * Lage config (the types are slightly incorrect about what's required/optional)
 * @type {Partial<Omit<ConfigOptions, 'cacheOptions'>> & { cacheOptions?: Partial<CacheOptions> }}
 */
const config = {
  pipeline: {
    build: {
      dependsOn: ['^build'],
      outputs: ['lib/**/*'],
    },
    lint: ['build'],
    test: ['build'],
    api: {
      dependsOn: ['build'],
      outputs: ['temp/*.api.md'],
    },
    'api:update': {
      dependsOn: ['build'],
      outputs: ['temp/*.api.md'],
    },
  },

  npmClient: 'yarn',

  cacheOptions: {
    // These are relative to the git root, and affects the hash of the cache
    // Any of these file changes will invalidate cache
    environmentGlob: [
      // Folder globs MUST end with **/* to include all files!
      '*.js',
      '*.json',
      '*.yml',
      'yarn.lock',
      'scripts/**/*',
    ],

    // Subset of files in package directories that will be saved into the cache.
    // (set per target instead)
    outputGlob: [],
  },
};

module.exports = config;
