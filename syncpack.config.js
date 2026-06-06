// @ts-check

// https://jamiemason.github.io/syncpack/
/** @type {import('syncpack').RcFile} */
const config = {
  versionGroups: [
    {
      // Peer deps must only match each other
      label: 'peer deps',
      dependencies: ['**'],
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
