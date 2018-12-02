import yargs from 'yargs';
import fs from 'fs';
import path from 'path';
import { undertaker, parallel } from './index';
import UndertakerRegistry from 'undertaker-registry';
import Undertaker from 'undertaker';
import { logger } from './logger';

class RigRegistry extends UndertakerRegistry {
  public argv: yargs.Argv | undefined;
  init(taker: Undertaker) {
    const rigFile = path.join(process.cwd(), 'rig.js');

    if (fs.existsSync(rigFile)) {
      require(rigFile);
    } else {
      logger.error(`Cannot find a rig file. Please create one called "rig.js" in the root of the project next to "package.json"`);
    }
  }
}

const rigRegistry = new RigRegistry();

undertaker.registry(rigRegistry);

const tree = undertaker.tree();

const builtYargs = yargs
  .demandCommand()
  .version(require('../package.json').version)
  .usage('rig <cmd> [options]');

((tree.nodes as any) as string[]).reduce((builder, node) => {
  return builder.command({
    command: node,
    handler: argv => {
      rigRegistry.argv = argv;
      return parallel(node)(() => {});
    }
  });
}, yargs);

builtYargs.help().argv;
