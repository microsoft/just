module.exports = function(plop) {
  plop.setGenerator('repo:just-stack-react', {
    actions: [
      {
        type: 'addMany',
        templateFiles: ['plop-templates/**/*', 'plop-templates/**/.*'],
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
