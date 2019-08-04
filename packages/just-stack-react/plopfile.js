module.exports = function(plop) {
  plop.setGenerator('repo', {
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Enter a name for the project: '
      }
    ],
    actions: [
      {
        type: 'addMany',
        templateFiles: ['plop-templates/**/*.*', 'plop-templates/**/.*'],
        destination: '.'
      }
    ]
  });
};
