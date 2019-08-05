module.exports = function(plop) {
  plop.load('just-plop-helpers');
  plop.setGenerator('repo:just-stack-monorepo', {
    actions: [
      {
        type: 'addMany',
        templateFiles: ['plop-templates/**/*.*', 'plop-templates/**/.*'],
        base: 'plop-templates/repo',
        destination: '.',
        force: true
      },
      {
        type: 'rename',
        src: 'gitignore',
        dest: '.gitignore'
      }
    ]
  });
};
