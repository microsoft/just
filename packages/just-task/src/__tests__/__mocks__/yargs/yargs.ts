// This is a clone of the ../yargs.ts file but exported as a commonjs module, simulating yargs/yargs

const yargs = () => yargs;

yargs.argv = {
  config: undefined
} as { config: string | undefined };

yargs.command = () => yargs;

yargs.demandCommand = () => yargs;

yargs.help = () => yargs;

export = yargs;
