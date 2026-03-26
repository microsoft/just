# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Just** is a Microsoft build task organization library for JavaScript/TypeScript projects. It provides a task runner (`just-task`) and preset build scripts (`just-scripts`) for common workflows (TypeScript, Webpack, Jest, ESLint, etc.).

## Monorepo Structure

- **Yarn workspaces** with **Lage** for task orchestration
- Workspaces: `packages/*` and `scripts/`
- Three packages:
  - `packages/just-task` — Core task runner (CLI: `npx just <task>`, config: `just.config.ts`)
  - `packages/just-scripts` — Preset task functions (`tscTask`, `jestTask`, `webpackTask`, eslintTask, etc.)
  - `packages/just-example-lib` — Example/integration test project

## Common Commands

```bash
yarn build                # Build all packages (via Lage)
yarn test                 # Run all tests (via Lage)
yarn lint                 # ESLint on packages/ (.ts,.js)
yarn api:update           # Update API reports for all packages
yarn format               # Prettier write
yarn format:check         # Prettier check (CI uses this)
yarn change               # Create Beachball change file (required before PR)
```

### Running a single package's tests

```bash
cd packages/just-task && yarn jest              # Run just-task tests
cd packages/just-task && yarn jest --testPathPattern=cache  # Run specific test file
```

### Required before each commit

- `yarn build`
- `yarn test`
- `yarn lint`
- `yarn format`
- `yarn api:update`

### Required before creating a PR

- Use `/beachball-change-files` to generate a Beachball change file.
- If you're working on an assigned GitHub issue, include `Fixes #N` in the PR description to link the issue.

## Architecture

### Task System (just-task)

Built on **Undertaker** (Gulp's task orchestrator). Key modules in `packages/just-task/src/`:

- `task.ts` — `task(name, fn)` registration; supports prerequisite chaining
- `undertaker.ts` — Wraps Undertaker with event-based colored logging and perf tracking
- `cli.ts` — CLI entry point; resolves config file and bootstraps tasks
- `config.ts` — Config resolution: `just.config.{js,cjs,ts,cts}` or `just-task.js`
- `chain.ts` — `before()`/`after()` hooks for task composition
- `option.ts` — CLI argument parsing with yargs-parser

Task functions can: return a Promise, call a `done` callback, or return a stream. Composition via `series()` and `parallel()` from Undertaker.

### Preset Tasks (just-scripts)

`packages/just-scripts/src/tasks/` contains factory functions that return task functions: `tscTask()`, `jestTask()`, `webpackTask()`, `eslintTask()`, `prettierTask()`, `copyTask()`, `esbuildTask()`, `nodeExecTask()`, etc.

## Code Style

- TypeScript target: `es2019`, module: `commonjs`, strict mode
- Prettier: 120 print width, single quotes, trailing commas, 2-space indent
- Tests:
  - Jest with ts-jest
  - Test files in `src/**/__tests__/*.(test|spec).ts`
  - Functions such as `describe`, `it`, `expect` must be imported from `@jest/globals` (they are not implicitly available)
- Each package compiles to `lib/` directory

## CI / Release

- PR checks: format:check → lint → build/test/api (Ubuntu + Windows, Node 14)
- Release: Beachball publish (manual trigger), docs deployed to GitHub Pages
