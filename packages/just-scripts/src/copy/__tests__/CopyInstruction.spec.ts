import { copyFilesToDestinationDirectory } from '../CopyInstruction';
import { normalize } from 'path';

describe('CopyInstruction tests', () => {
  it('copies files with the same name to the target directory', () => {
    const result = copyFilesToDestinationDirectory(['files/foo.js', 'my/path/bar.js'], 'dist/lib/');

    expect(result.length).toEqual(2);
    expect(result[0].sourceFilePath).toEqual(normalize('files/foo.js'));
    expect(result[0].destinationFilePath).toEqual(normalize('dist/lib/foo.js'));
    expect(result[1].sourceFilePath).toEqual(normalize('my/path/bar.js'));
    expect(result[1].destinationFilePath).toEqual(normalize('dist/lib/bar.js'));
  });
});
