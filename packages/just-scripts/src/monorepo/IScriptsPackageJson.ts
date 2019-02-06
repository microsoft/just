import { IPackageJson } from 'just-scripts-utils';

export interface IScriptsPackageJson extends IPackageJson {
  just?: {
    stack?: string;
    stacks?: string[];
  };
}
