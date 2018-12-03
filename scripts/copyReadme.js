const cpx = require('cpx');
const path = require('path');

cpx.copySync(path.resolve(__dirname, '../README.md'), path.resolve(__dirname, '../packages/build-rg'));
