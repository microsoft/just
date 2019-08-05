module.exports = function(plop) {
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
        templateFiles: ['plop-templates/react-package/**'],
        destination: '{{name}}',
        force: true
      }
    ]
  });
};
