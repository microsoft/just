module.exports = {
  pipeline: {
    build: ['^build'],
    test: ['build'],
    api: ['build'],
    'api:update': ['build'],
  },

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
  outputGlob: ['lib/**/*', 'temp/*.api.md'],
};
