import yargs from 'yargs';

export function option(): yargs.Argv {
  return yargs.option.apply(yargs, arguments);
}

export function argv(): yargs.Arguments {
  return yargs.argv;
}
