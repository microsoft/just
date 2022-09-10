import { Options, Arguments } from 'yargs-parser';
import parser = require('yargs-parser');

export interface OptionConfig {
  /** Aliases for the argument, can be a string or array */
  alias?: string | string[];

  /** Argument should be an array */
  array?: boolean;

  /** Argument should be parsed as booleans: `{ boolean: ['x', 'y'] }`. */
  boolean?: boolean;

  /**
   * Provide a custom synchronous function that returns a coerced value from the argument provided (or throws an error), e.g.
   * `{ coerce: function (arg) { return modifiedArg } }`.
   */
  coerce?: (arg: any) => any;

  /** Indicate a key that should be used as a counter, e.g., `-vvv = {v: 3}`. */
  count?: boolean;

  /** Provide default value: `{ default: 'hello world!' }`. */
  default?: any;

  /** Specify that a key requires n arguments: `{ narg: {x: 2} }`. */
  narg?: number;

  /** `path.normalize()` will be applied to values set to this key. */
  normalize?: boolean;

  /** Keys should be treated as strings (even if they resemble a number `-x 33`). */
  string?: boolean;

  /** Keys should be treated as numbers. */
  number?: boolean;

  /** A description of the option */
  describe?: string;
}

const argOptions: Options = {};
const descriptions: { [key: string]: string } = {};
const processArgs = process.argv.slice(2);

export function option(key: string, options: OptionConfig = {}): void {
  const booleanArgs = ['array', 'boolean', 'count', 'normalize', 'string', 'number'] as const;
  const assignArgs = ['alias', 'coerce', 'default'] as const;

  for (const argName of booleanArgs) {
    if (options[argName]) {
      const argOpts = (argOptions[argName] ??= []) as string[];

      if (argOpts.indexOf(key) === -1) {
        argOpts.push(key);
      }
    }
  }

  for (const argName of assignArgs) {
    if (options[argName]) {
      (argOptions[argName] ??= {})[key] = options[argName];
    }
  }

  if (options.describe) {
    descriptions[key] = options.describe;
  }
}

export function argv(): Arguments {
  return parser(processArgs, argOptions);
}

export function parseCommand(): string | null {
  const positionals = argv()._;

  if (positionals.length > 0) {
    return positionals[0];
  }

  return null;
}
