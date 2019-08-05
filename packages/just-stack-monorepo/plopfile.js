module.exports = function(plop) {
  plop.setGenerator('repo:just-stack-monorepo', {
    actions: [
      {
        type: 'addMany',
        templateFiles: ['plop-templates/repo/**'],
        destination: '.',
        force: true
      }
    ]
  });
};
