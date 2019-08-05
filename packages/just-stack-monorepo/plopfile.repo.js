const fs = require('fs');

module.exports = function(plop) {
  const packageJson = JSON.parse(fs.readFileSync(require.resolve('package.json', { paths: [process.cwd()] })));

  plop.setGenerator('react-package', {
    description: `Generates a React package`,
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Enter a name for the package: '
      }
    ],
    actions: [
      {
        type: 'addMany',
        templateFiles: ['plop-templates/react-package/**/*', 'plop-templates/react-package/**/.*'],
        destination: 'packages/{{name}}',
        base: 'plop-templates/react-package',
        data: {
          repoName: packageJson.name
        }
      }
    ]
  });
};
