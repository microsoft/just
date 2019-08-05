module.exports = function(plop) {
  plop.setGenerator('repo', {
    actions: [
      {
        type: 'addMany',
        templateFiles: ['plop-templates/**/*.*', 'plop-templates/**/.*'],
        destination: '.'
      }
    ]
  });
};
