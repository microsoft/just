import { PackageJson } from 'just-scripts-utils';

export interface ScriptsPackageJson extends PackageJson {
  just?: {
    stack?: string;
    stacks?: string[];
  };
}
