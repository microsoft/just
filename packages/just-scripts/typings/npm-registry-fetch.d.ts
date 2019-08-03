/* eslint-disable @typescript-eslint/no-empty-interface */
// TODO: fill out the typing for this
declare module 'npm-registry-fetch' {
  interface Options {}
  interface Response {}
  interface Fetch {
    (url: string, opts?: Options): Promise<Response>;
    json: (url: string, opts?: Options) => Promise<Response>;
  }
  export = Fetch;
}
