const renameAction = require('./actions/renameAction');
const addDependencyAction = require('./actions/addDependencyAction');

module.exports = (plop) => {
  plop.setActionType('rename', renameAction);
  plop.setActionType('addDependency', addDependencyAction);
  plop.setDefaultInclude({ actionTypes: true });
};
