import path from 'path';
import os from 'os';
import { paths } from '../paths';

describe('paths', () => {
  describe('projectPath', () => {
    afterEach(() => {
      paths.projectPath = '';
    });

    it('defaults to cwd', () => {
      expect(paths.projectPath).toEqual(process.cwd());
    });

    it('respects updated setting', () => {
      paths.projectPath = 'foo';
      expect(paths.projectPath).toEqual('foo');
    });
  });

  describe('tempPath', () => {
    it('returns default value', () => {
      const defaultPath = path.resolve(os.tmpdir(), 'just-stack');
      expect(paths.tempPath()).toEqual(defaultPath);
    });

    it('uses extra path segments', () => {
      const extraPath = path.resolve(os.tmpdir(), 'just-stack', 'foo', 'bar');
      expect(paths.tempPath('foo', 'bar')).toEqual(extraPath);
    });
  });
});
