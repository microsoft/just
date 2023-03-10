export interface Dependencies {
  [key: string]: string;
}

export interface PackageJson {
  name: string;
  description?: string;
  dependencies?: Dependencies;
  devDependencies?: Dependencies;
  keywords?: string;
  just?: {
    /** Stack that the package is tracking */
    stack?: string;
  };
  [key: string]: any;
}
