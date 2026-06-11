export interface Dependencies {
  [key: string]: string;
}

export interface PackageJson {
  name: string;
  dependencies?: Dependencies;
  devDependencies?: Dependencies;
  bin?: string | Record<string, string>;
  [key: string]: unknown;
}
