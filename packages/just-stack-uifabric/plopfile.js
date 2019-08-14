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
      {
        type: 'addDependency',
        dependencies: {
          'office-ui-fabric-react': '^7.0.0'
        }
      }
    ]
  });
};
