const fs = require('fs');
const path = require('path');

module.exports = (answers, config, plop) => {
  const basePath = plop.getDestBasePath();
  const packageJson = JSON.parse(fs.readFileSync(path.join(basePath, 'package.json')));

  if (config.dependencies) {
    packageJson.dependencies = { ...packageJson.dependencies, ...config.dependencies };
  }

  if (config.devDependencies) {
    packageJson.devDependencies = { ...packageJson.dependencies, ...config.devDependencies };
  }

  fs.writeFileSync(path.join(basePath, 'package.json'), JSON.stringify(packageJson, null, 2));

  return 'Added dependencies';
};
