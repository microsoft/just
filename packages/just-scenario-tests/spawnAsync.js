// @ts-check
const cp = require('child_process');

module.exports = function spawnAsync(cmd, args, options) {
  return new Promise((resolve, reject) => {
    const proc = cp.spawn(cmd, args, {
      ...options,
      stdio: 'pipe'
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', data => {
      stdout += data.toString();
    });

    proc.stderr.on('data', data => {
      stderr += data.toString();
    });

    proc.on('exit', code => {
      resolve({
        code,
        stdout,
        stderr
      });
    });

    proc.on('error', e => {
      reject(e);
    });
  });
};
