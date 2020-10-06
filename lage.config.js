module.exports = {
  pipeline: {
    build: ['^build'],
    test: ['build']
  },

  // These are relative to the git root, and affects the hash of the cache
  // Any of these file changes will invalidate cache
  environmentGlob: ['*.js', '*.json', '*.yml']
};
