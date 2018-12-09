import yargs from 'yargs';

export function option(key: string, options: yargs.Options = {}): yargs.Argv {
  return yargs.option.apply(yargs, [key, options]);
}

export function argv(): yargs.Arguments {
  return yargs.argv;
}
