const yargs = () => yargs;

yargs.argv = {
  config: undefined
} as { config: string | undefined };

yargs.command = () => yargs;

yargs.demandCommand = () => yargs;

yargs.help = () => yargs;

export default yargs;
