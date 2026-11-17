import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

let parse;
try {
  parse = (await import('yaml')).parse;
} catch {
  parse = (await import('js-yaml')).load;
}

const [baseRef = 'HEAD', lockfile = 'yarn.lock'] = process.argv.slice(2);
const oldText = execFileSync('git', ['show', `${baseRef}:${lockfile}`], { encoding: 'utf8' });
const newText = fs.readFileSync(lockfile, 'utf8');

/** Group lockfile entries by package name and version, collapsing peer-context duplicates. */
function collect(text) {
  const lock = parse(text);
  if (!lock || !lock.__metadata) {
    throw new Error('Expected a modern Yarn YAML lockfile with __metadata.');
  }

  const packages = new Map();
  for (const [descriptors, entry] of Object.entries(lock)) {
    if (!entry.resolution || !entry.version) continue;
    const name = entry.resolution.match(/^(@[^/]+\/[^@]+|[^@]+)@/)[1];
    if (!packages.has(name)) packages.set(name, new Map());
    const versions = packages.get(name);
    if (!versions.has(entry.version)) versions.set(entry.version, []);
    versions.get(entry.version).push({ descriptors, resolution: entry.resolution });
  }
  return packages;
}

const before = collect(oldText);
const after = collect(newText);
for (const [name, versions] of after) {
  if (versions.size < 2) continue;
  const previous = before.get(name) || new Map();
  const added = [...versions.keys()].filter(version => !previous.has(version));
  if (!added.length) continue;
  console.log(
    JSON.stringify({
      name,
      before: [...previous.keys()],
      after: [...versions.keys()],
      added,
      increased: versions.size > previous.size,
      entries: Object.fromEntries(versions),
    }),
  );
}
console.log(
  JSON.stringify({
    summary: {
      packagesBefore: before.size,
      packagesAfter: after.size,
      duplicatedBefore: [...before.values()].filter(versions => versions.size > 1).length,
      duplicatedAfter: [...after.values()].filter(versions => versions.size > 1).length,
    },
  }),
);
