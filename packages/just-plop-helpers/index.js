const renameAction = require('./actions/renameAction');

module.exports = plop => {
  plop.setActionType('rename', renameAction);
  plop.setDefaultInclude({ actionTypes: true });
};
