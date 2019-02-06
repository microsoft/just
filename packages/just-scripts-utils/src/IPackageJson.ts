export interface IPackageJson {
  name: string;
  description: string;
  dependencies?: { [key: string]: string };
  devDependencies?: { [key: string]: string };
  just?: {
    /** Stack that the package is tracking */
    stack?: string;
  };
  [key: string]: any;
}
