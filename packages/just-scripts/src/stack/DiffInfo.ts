/*eslint @typescript-eslint/camelcase: ["error", {allow: ["patch_obj"]}]*/
import { patch_obj } from 'diff-match-patch';

export interface DiffInfo {
  patches: { [filename: string]: patch_obj[] };
  fromVersion: string;
  toVersion: string;
}
