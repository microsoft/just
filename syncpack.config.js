// @ts-check

/** @type {import("syncpack").RcFile} */
const config = {
  versionGroups: [
    {
      // These are intentionally broader ranges than the devDependencies
      label: 'Ignore optional peer dependencies',
      isIgnored: true,
      dependencyTypes: ['peer'],
    },
  ],
};

module.exports = config;
