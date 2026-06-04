// some TS syntax
export type Foo = number;
export interface Bar {
  bar: string;
}
console.log('hello', ...process.argv.slice(2));
console.log(
  Object.entries(process.env)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n'),
);
