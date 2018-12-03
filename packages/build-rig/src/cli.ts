import yargs from 'yargs';
import fs from 'fs';
import path from 'path';
import { undertaker, parallel } from './index';
import { taskCommandModuleMap } from './task';
import UndertakerRegistry from 'undertaker-registry';
import Undertaker from 'undertaker';
import { logger, taskLogger } from './logger';

const yargsBuilder = yargs
  .demandCommand()
  .option({ config: {} })
  .version(require('../package.json').version)
  .usage('rig <cmd> [options]');

interface WithTaskMap {
  _tasks: { [task: string]: any };
}

class RigRegistry extends UndertakerRegistry {
  public argv: yargs.Argv;

  constructor(argv: yargs.Argv) {
    super();
    this.argv = argv;
  }

  init(taker: Undertaker) {
    const configFile = this.argv.argv.config || 'rig.js';

    const rigFile = path.join(process.cwd(), configFile);

    if (fs.existsSync(rigFile)) {
      require(rigFile);
    } else {
      logger.error(`Cannot find a rig file. Please create one called "rig.js" in the root of the project next to "package.json"`);
    }
  }

  set<TTaskFunction>(this: RigRegistry & WithTaskMap, taskName: string, fn: TTaskFunction): TTaskFunction {
    let commandModule = taskCommandModuleMap[taskName];

    commandModule = commandModule || {};

    commandModule = {
      ...commandModule,
      command: taskName,
      ...(taskName === 'default' && { aliases: ['*'] }),
      handler(argvParam: any) {
        rigRegistry.argv = argvParam;
        return parallel(taskName)(() => {});
      }
    };

    this.argv = this.argv.command(commandModule);

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

const rigRegistry = new RigRegistry(yargsBuilder);

undertaker.registry(rigRegistry);

rigRegistry.argv.parse();
