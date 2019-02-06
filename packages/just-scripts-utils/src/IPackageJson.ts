export interface IDependencies {
  [key: string]: string;
}

export interface IPackageJson {
  name: string;
  description?: string;
  dependencies?: IDependencies;
  devDependencies?: IDependencies;
  just?: {
    /** Stack that the package is tracking */
    stack?: string;
  };
  [key: string]: any;
}
