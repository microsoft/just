import { describe, expect, it } from '@jest/globals';
import { watch } from '../watch';
import fs from 'fs';
import path from 'path';
import os from 'os';

describe('watch', () => {
  it('can take a synchronous taskFunction', done => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'watch-sync'));
    const changeFile = path.join(tmpDir, 'change.txt');

    fs.mkdirSync(tmpDir, { recursive: true });
    fs.writeFileSync(changeFile, 'to be changed');

    const cleanup = async () => {
      await watcher.close();

      fs.unlinkSync(changeFile);
      fs.rmdirSync(tmpDir);
    };

    const callback = () => {
      try {
        expect(true).toBeTruthy();
        cleanup().then(() => done(), done);
      } catch (error) {
        const errDone = () => done(error instanceof Error ? error : new Error(String(error)));
        cleanup().then(errDone, errDone);
      }
    };

    const watcher = watch([path.join(changeFile)], callback);

    watcher.on('ready', () => {
      fs.writeFileSync(changeFile, 'new content');
    });
  });
});
