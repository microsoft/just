import { undertaker } from './undertaker';
import { JustTaskRegistry } from './JustTaskRegistry';
import yargs from 'yargs';

const yargsBuilder = yargs.option({ config: { describe: 'path to a rig file, defaults to rig.js' } }).usage('rig <cmd> [options]');

const registry = new JustTaskRegistry(yargsBuilder);

undertaker.registry(registry);

registry.argv.parse();
