module.exports = plop => {
  plop.setGenerator('component', {
    prompts: [
      {
        type: 'input',
        name: 'componentName',
        message: 'Name of the component (will be converted to PascalCase): '
      }
    ],

    actions: [
      {
        type: 'add',
        templateFile: 'plop-templates/component/component.tsx.hbs',
        path: 'src/components/{{pascalCase componentName}}.tsx'
      }
    ]
  });
};
