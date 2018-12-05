import yargs from 'yargs';
import fs from 'fs';
import path from 'path';
import { logger, taskLogger } from './logger';
import { taskCommandModuleMap } from './taskCommandModuleMap';

import UndertakerRegistry from 'undertaker-registry';
import Undertaker from 'undertaker';

const yargsFn = require('yargs/yargs');

interface WithTaskMap {
  _tasks: { [task: string]: any };
}

export class JustTaskRegistry extends UndertakerRegistry {
  public argv: yargs.Argv;
  private hasDefault: boolean = false;
  private taker: Undertaker | undefined;

  constructor(argv: yargs.Argv) {
    super();
    this.argv = argv;
  }

  init(taker: Undertaker) {
    // uses a separate instance of yargs to first parse the config (without the --help in the way) so we can parse the configFile first regardless
    let configFile = yargsFn(process.argv.slice(1).filter(a => a !== '--help')).argv.config || 'just-task.js';

    if (!path.isAbsolute(configFile)) {
      configFile = path.join(process.cwd(), configFile);
    }

    if (fs.existsSync(configFile)) {
      require(configFile);
    } else {
      logger.error(
        `Cannot find '${configFile}'. Please create one called "just-task.js" in the root of the project next to "package.json"`
      );
    }

    if (!this.hasDefault) {
      this.argv.demandCommand().help();
    }

    this.taker = taker;
  }

  set<TTaskFunction>(this: JustTaskRegistry & WithTaskMap, taskName: string, fn: TTaskFunction): TTaskFunction {
    if (taskName === 'default') {
      this.hasDefault = true;
    }

    let commandModule = taskCommandModuleMap[taskName];

    const registry = this;

    commandModule = commandModule || {};

    commandModule = {
      ...commandModule,
      command: commandModule.command || taskName,
      ...(taskName === 'default' && { aliases: [...(commandModule.aliases ? commandModule.aliases : []), ...['*']] }),
      handler(argvParam: any) {
        return registry.taker!.parallel(taskName)(() => {});
      }
    };

    this.argv.command(commandModule as yargs.CommandModule);

    const task = (this._tasks[taskName] = this.wrapFn(taskName, fn));

    return task as any;
  }

  private wrapFn(taskName: string, fn: any) {
    const context = {
      logger: taskLogger(taskName)
    };

    Object.defineProperty(context, 'argv', {
      get: () => this.argv
    });

    return function(done: any) {
      let origFn = fn;
      if (fn.unwrap) {
        origFn = fn.unwrap();
      }

      if (origFn.length > 0) {
        (fn as any).call(context, done);
      } else {
        let results = (fn as any).apply(context);
        if (results && results.then) {
          results.then(() => {
            done();
          });
        } else {
          done();
        }
      }
    };
  }
}
