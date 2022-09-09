const fs = require('fs');
const path = require('path');

const mainReadme = path.resolve(__dirname, '../README.md');
const justTaskReadme = path.resolve(__dirname, '../packages/just-task/README.md');
fs.copyFileSync(mainReadme, justTaskReadme);
