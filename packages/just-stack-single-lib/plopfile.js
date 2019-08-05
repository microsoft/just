module.exports = function(plop) {
  plop.load('just-plop-helpers');
  plop.setGenerator('repo', {
    actions: [
      {
        type: 'addMany',
        templateFiles: ['plop-templates/**/*', 'plop-templates/**/.*'],
        destination: '.'
      },
      {
        type: 'rename',
        src: 'gitignore',
        dest: '.gitignore'
      }
    ]
  });
};
