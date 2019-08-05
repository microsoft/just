const fs = require('fs');
const path = require('path');

module.exports = (answers, config, plop) => {
  const { src, dest, force } = config;

  if (!src || !dest) {
    throw new Error('both the "src" and "dest" configuration are needed for this action');
  }

  let destFileName = '';

  if (typeof dest === 'string') {
    destFileName = dest;
  } else if (typeof dest === 'function') {
    destFileName = dest(src);
  } else {
    throw new Error('"dest" can only be a string or function');
  }

  const srcFilePath = path.join(plop.getDestBasePath(), src);
  const destFilePath = path.join(plop.getDestBasePath(), destFileName);

  if (!fs.existsSync(srcFilePath)) {
    throw new Error(`${srcFilePath} does not exist`);
  }

  if (fs.existsSync(destFilePath) && !force) {
    throw new Error(`${destFilePath} already exists!`);
  }

  fs.renameSync(srcFilePath, destFilePath);

  return `successfully renamed ${srcFilePath} to ${destFilePath}`;
};
