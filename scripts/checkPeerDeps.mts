// Validates peerDependencies in selected workspace packages:
//   - every entry must be marked `optional: true` in `peerDependenciesMeta`
//   - every entry must have a rationale string in `rationale.peerDependencies`
//   - meta/rationale entries with no matching peerDependency are flagged as stale
//
// Exits non-zero (and prints all violations) if anything is missing.
//
// Usage: node scripts/checkPeerDeps.mts

import fs from 'fs/promises';
import path from 'path';

const repoRoot = path.resolve(import.meta.dirname, '..');

const PACKAGES_TO_CHECK = ['packages/just-task/package.json', 'packages/just-scripts/package.json'];

interface PackageJson {
  name?: string;
  peerDependencies?: Record<string, string>;
  peerDependenciesMeta?: Record<string, { optional?: boolean }>;
  rationale?: {
    peerDependencies?: Record<string, string>;
  };
}

async function checkPackage(relPath: string): Promise<string[]> {
  const absPath = path.join(repoRoot, relPath);
  const pkg = JSON.parse(await fs.readFile(absPath, 'utf8')) as PackageJson;
  const peers = pkg.peerDependencies ?? {};
  const meta = pkg.peerDependenciesMeta ?? {};
  const rationales = pkg.rationale?.peerDependencies ?? {};

  const names = Object.keys(peers).sort();
  const missingOptional: string[] = [];
  const missingRationale: string[] = [];

  for (const name of names) {
    if (meta[name]?.optional !== true) missingOptional.push(name);
    const rationale = rationales[name];
    if (typeof rationale !== 'string' || rationale.trim() === '') missingRationale.push(name);
  }

  const extraMeta = Object.keys(meta).filter(n => !(n in peers));
  const extraRationale = Object.keys(rationales).filter(n => !(n in peers));

  const problems: string[] = [];
  if (missingOptional.length > 0) {
    problems.push(
      `[${relPath}] peerDependencies not marked \`optional: true\` in peerDependenciesMeta:\n` +
        missingOptional.map(n => `  - ${n}`).join('\n'),
    );
  }
  if (missingRationale.length > 0) {
    problems.push(
      `[${relPath}] peerDependencies missing a rationale in \`rationale.peerDependencies\`:\n` +
        missingRationale.map(n => `  - ${n}`).join('\n'),
    );
  }
  if (extraMeta.length > 0) {
    problems.push(
      `[${relPath}] \`peerDependenciesMeta\` entries with no matching peerDependency:\n` +
        extraMeta.map(n => `  - ${n}`).join('\n'),
    );
  }
  if (extraRationale.length > 0) {
    problems.push(
      `[${relPath}] \`rationale.peerDependencies\` entries with no matching peerDependency:\n` +
        extraRationale.map(n => `  - ${n}`).join('\n'),
    );
  }

  if (problems.length === 0) {
    console.log(`checkPeerDeps: ${relPath} — all ${names.length} peerDependencies are optional and have a rationale.`);
  }

  return problems;
}

async function main(): Promise<void> {
  const allProblems: string[] = [];
  for (const relPath of PACKAGES_TO_CHECK) {
    allProblems.push(...(await checkPackage(relPath)));
  }

  if (allProblems.length > 0) {
    console.error(`\ncheckPeerDeps: problems found\n`);
    for (const p of allProblems) console.error(p + '\n');
    process.exit(1);
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
