import { watch } from '../watch';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('watch', () => {
  it('can take a synchronous taskFunction', done => {
    const tmpDir = path.join(os.tmpdir(), fs.mkdtempSync('watch-sync'));
    const changeFile = path.join(tmpDir, 'change.txt');

    fs.mkdirSync(tmpDir, { recursive: true });
    fs.writeFileSync(changeFile, 'to be changed');

    const cleanup = () => {
      watcher.close();

      fs.unlinkSync(changeFile);
      fs.rmdirSync(tmpDir);
    };

    const callback = () => {
      try {
        expect(true).toBeTruthy();
        cleanup();
        done();
      } catch (error) {
        cleanup();
        done(error);
      }
    };

    const watcher = watch([path.join(changeFile)], callback);

    watcher.on('ready', () => {
      fs.writeFileSync(changeFile, 'new content');
    });
  });
});
