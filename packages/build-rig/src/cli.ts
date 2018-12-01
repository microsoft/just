import yargs from 'yargs';
import fs from 'fs';
import path from 'path';
import { undertaker, parallel } from './index';
import UndertakerRegistry from 'undertaker-registry';
import Undertaker from 'undertaker';

class RigRegistry extends UndertakerRegistry {
  public argv: yargs.Argv | undefined;
  init(taker: Undertaker) {
    const rigFile = path.join(process.cwd(), 'rig.js');

    if (fs.existsSync(rigFile)) {
      require(rigFile);
    }
  }
}

const rigRegistry = new RigRegistry();

undertaker.registry(rigRegistry);

const tree = undertaker.tree();
const builtYargs = ((tree.nodes as any) as string[]).reduce((builder, node) => {
  return builder.command({
    command: node,
    handler: argv => {
      rigRegistry.argv = argv;
      return parallel(node)(() => {});
    }
  });
}, yargs.usage('$0 <task> [args]'));

builtYargs.help().argv;
