## API Report File for "just-task"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

/// <reference types="node" />

import { Arguments } from 'yargs-parser';
import { Duplex } from 'stream';
import type { FSWatcher } from 'chokidar';
import { Logger } from 'just-task-logger';
import type { Stats } from 'fs';
import { TaskFunction as TaskFunction_2 } from 'undertaker';
import { TaskFunctionParams } from 'undertaker';
import Undertaker = require('undertaker');
import type { WatchOptions } from 'chokidar';

// @public
export function addResolvePath(pathName: string): void;

// @public (undocumented)
export function argv(): Arguments;

// @public (undocumented)
export function chain(subjectTaskName: string): {
    before: (taskName: string) => void;
    after: (taskName: string) => void;
};

// @public (undocumented)
export function clearCache(): void;

// @public (undocumented)
export function condition(taskName: string, conditional: () => boolean): TaskFunction_2;

// Warning: (ae-forgotten-export) The symbol "OptionConfig" needs to be exported by the entry point index.d.ts
//
// @public (undocumented)
export function option(key: string, options?: OptionConfig): void;

// @public (undocumented)
interface OptionConfig {
    alias?: string | string[];
    array?: boolean;
    boolean?: boolean;
    coerce?: (arg: any) => any;
    count?: boolean;
    default?: any;
    describe?: string;
    narg?: number;
    normalize?: boolean;
    number?: boolean;
    string?: boolean;
}

// @public (undocumented)
export function parallel(...tasks: Task[]): Undertaker.TaskFunction;

// @public
export function resetResolvePaths(): void;

// Warning: (ae-forgotten-export) The symbol "ResolveOptions" needs to be exported by the entry point index.d.ts
//
// @public
export function resolve(moduleName: string, options?: ResolveOptions): string | null;

// @public @deprecated
export function resolve(moduleName: string, cwd?: string): string | null;

// @public
export function resolveCwd(moduleName: string, options?: ResolveOptions): string | null;

// @public @deprecated
export function resolveCwd(moduleName: string, cwd?: string): string | null;

// @public (undocumented)
interface ResolveOptions {
    cwd?: string;
    extensions?: string[];
}

// @public (undocumented)
export function series(...tasks: Task[]): Undertaker.TaskFunction;

// @public (undocumented)
export type Task = string | TaskFunction;

// @public (undocumented)
export function task(firstParam: string | TaskFunction, secondParam?: string | TaskFunction, thirdParam?: TaskFunction): TaskFunction;

// @public (undocumented)
export interface TaskContext {
    // (undocumented)
    argv: Arguments;
    // (undocumented)
    logger: Logger;
}

// @public (undocumented)
export interface TaskFunction extends TaskFunctionParams {
    // (undocumented)
    (this: TaskContext, done: (error?: any) => void): void | Duplex | NodeJS.Process | Promise<never> | any;
    // (undocumented)
    cached?: () => void;
    // (undocumented)
    description?: string;
}

// @public (undocumented)
export const undertaker: Undertaker;

// Warning: (ae-forgotten-export) The symbol "WatchListener" needs to be exported by the entry point index.d.ts
//
// @public (undocumented)
export function watch(globs: string | string[], optionsOrListener?: WatchListener | WatchOptions | undefined, listener?: WatchListener | undefined): FSWatcher;

// @public (undocumented)
type WatchListener = (path: string, stats?: Stats) => void;


export * from "just-task-logger";

// (No @packageDocumentation comment for this package)

```
