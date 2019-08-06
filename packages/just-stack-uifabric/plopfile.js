const fs = require('fs');
const path = require('path');

module.exports = function(plop) {
  plop.setGenerator('repo:just-stack-uifabric', {
    parent: 'just-stack-react',
    prompts: [],
    actions: [
      {
        type: 'repo:parent'
      },
      {
        type: 'addMany',
        templateFiles: ['plop-templates/**/*', 'plop-templates/**/.*'],
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
