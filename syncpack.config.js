// @ts-check

// https://syncpack.dev/
/** @type {import('syncpack').RcFile} */
const config = {
  versionGroups: [
    {
      // These are intentionally broader ranges than the devDependencies
      label: 'Optional peer deps',
      dependencyTypes: ['peer'],
    },
  ],
  semverGroups: [
    {
      label: 'internal deps use workspace protocol',
      dependencies: ['just-*', '@microsoft/just-*'],
      range: '^',
      specifierTypes: ['workspace-protocol'],
    },
  ],
};

module.exports = config;
