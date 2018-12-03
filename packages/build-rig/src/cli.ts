import { undertaker } from './undertaker';
import { RigRegistry } from './RigRegistry';
import yargs from 'yargs';

const yargsBuilder = yargs.option({ config: { describe: 'path to a rig file, defaults to rig.js' } }).usage('rig <cmd> [options]');

const registry = new RigRegistry(yargsBuilder);

undertaker.registry(registry);

registry.argv.parse();
