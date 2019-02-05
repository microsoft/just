import path from 'path';
import os from 'os';

let installPath: string = '';

export const paths = {
  /**
   * Gets the location where the generated project will go. Defaults to `process.cwd()`.
   */
  get installPath(): string {
    return installPath || process.cwd();
  },

  /**
   * Sets the location where the generated project will go.
   */
  set installPath(value: string) {
    installPath = value;
  },

  /**
   * Gets a directory path under `${os.tmpdir()}/just-stack` for temporarily storing files.
   * @param segments Names of extra directory segments to include.
   * @returns The directory path.
   */
  tempPath(...segments: string[]): string {
    return path.resolve(os.tmpdir(), 'just-stack', ...segments);
  }
};
