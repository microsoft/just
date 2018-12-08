import yargs from 'yargs';
import fs from 'fs';
import { logger } from './logger';

import UndertakerRegistry from 'undertaker-registry';
import Undertaker from 'undertaker';
import { resolve } from './resolve';

export class JustTaskRegistry extends UndertakerRegistry {
  private hasDefault: boolean = false;

  init(taker: Undertaker) {
    super.init(taker);

    // uses a separate instance of yargs to first parse the config (without the --help in the way) so we can parse the configFile first regardless
    let configFile = resolve('./just-task.js');

    if (configFile && fs.existsSync(configFile)) {
      require(configFile);
    } else {
      logger.error(
        `Cannot find '${configFile}'. Please create one called "just-task.js" in the root of the project next to "package.json"`
      );
    }

    if (!this.hasDefault) {
      yargs.demandCommand().help();
    }
  }

  set<TTaskFunction>(taskName: string, fn: TTaskFunction): TTaskFunction {
    super.set(taskName, fn);

    if (taskName === 'default') {
      this.hasDefault = true;
    }

    return fn;
  }
}
