Update the config loading approach and introduce new binaries to support ESM configs. This addresses part of #572 and #686 as much as is possible without a potential breaking change.

### Allow more extensions for config files

- `.cjs` and `.mjs` configs will "just work"
- `.cts` configs will work with `ts-node` 10 (which added `.cts` and `.mts` support)
- `.mts` is allowed, but will ONLY work if with the new `just-esm`/`just-scripts-esm` binaries (next section)
  - This restriction also applies to `.ts` configs in a **module context** (`type: "module"` in package.json)

### Add new binaries to support TS ESM config files (+ `tsx` support)

Add two new binaries which **spawn a new process** to run the Just CLI via `tsx` or `ts-node-esm` (depending on what's installed in the repo):

- `just-scripts-esm` (`just-scripts` package)
- `just-esm` (`just-task` package)

You **must** use one of these binaries if you want to use a `.ts` or `.mts` config file **in a module context** (`type: "module"` in package.json).

They should also work in a CJS context, like if you just want to use `tsx` instead of `ts-node`. (It unfortunately doesn't appear to be possible to enable `tsx` or `ts-node-esm` with an after-the-fact `register()` call like with traditional `ts-node`.)

### Load ESM configs with `import()`

Update the config loading logic to use `import()` for ESM configs. A config is considered ESM if one of the following is true:

- It has a `.mjs` or `.mts` extension
- The package.json has `"type": "module"` and the config has a `.js` or `.ts` extension (but see notes below)

This required updating the repo version of `typescript` to 4.7 so that I could use the `module`/`moduleResolution` `"Node16"` setting to prevent the `import()` from being transpiled to `require()`.

### Updates to `ts-node` setup

Also made some updates to the `ts-node` `register()` logic, for the previous TS loading approach

- Check the local `typescript` version and if it's >= 4.7, set `ts-node`'s `module`/`moduleResolution` to `"Node16"` (to prevent dynamic `import()` from being transpiled to `require()`)
- Skip `ts-node` `register()` if already running in `ts-node` or `tsx` (from the new binaries)
