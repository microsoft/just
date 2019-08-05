const fs = require('fs');
const path = require('path');
const nodePlop = require('node-plop');

module.exports = function(plop) {
  const reactPlop = nodePlop(require.resolve('just-stack-react/plopfile.js'), {
    destBasePath: plop.getDestBasePath(),
    force: true
  });

  plop.setGenerator('repo:just-stack-uifabric', {
    prompts: [],
    actions: [
      async data => {
        const reactGenerator = reactPlop.getGenerator('repo:just-stack-react');
        const results = await reactGenerator.runActions(data);
        if (results.changes) {
          return results.changes.map(change => change.path).join('\n');
        }
      },
      {
        type: 'addMany',
        templateFiles: ['plop-templates/**'],
        destination: '.',
        force: true
      },
      answers => {
        // Modifies the package.json a bit
        const basePath = plop.getDestBasePath();
        const packageJson = JSON.parse(fs.readFileSync(path.join(basePath, 'package.json')));
        packageJson.dependencies['office-ui-fabric-react'] = '^7.0.0';
        fs.writeFileSync(path.join(basePath, 'package.json'), JSON.stringify(packageJson, null, 2));
        return 'Added UI Fabric dependency';
      }
    ]
  });
};
