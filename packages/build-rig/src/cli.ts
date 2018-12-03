import { undertaker } from './undertaker';
import { RigRegistry } from './RigRegistry';
import yargs from 'yargs';

const yargsBuilder = yargs
  .demandCommand()
  .option({ config: {} })
  .usage('rig <cmd> [options]');

const registry = new RigRegistry(yargsBuilder);

undertaker.registry(registry);

registry.argv.parse();
