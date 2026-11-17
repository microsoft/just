---
name: lockfile-duplicates
description: 'Check for newly duplicated dependency versions when evaluating a Renovate lock file maintenance PR, reviewing any dependency update PR, updating dependencies, or deduplicating Yarn lockfiles. Compare root and docs lockfiles against the appropriate Git baseline and investigate new duplicate trees.'
---

# Check lockfile duplicates

## Choose the comparison

1. Inspect `git status --short` and identify the lockfiles changed by the update. Preserve existing edits; do not stage, stash, commit, or switch branches without authorization.
2. For a PR review, identify its actual target branch and calculate `git merge-base HEAD <target-ref>` using the reviewed PR head. Use that SHA as the baseline, not `HEAD`: comparing an already committed PR against itself hides its changes. Do not assume the target is `main`; this repository also uses `v2`. If the target ref is unavailable locally, fetch it when permitted or report that the comparison is blocked.
3. For uncommitted dependency edits, use `HEAD` as the baseline. If the branch also contains committed updates in scope, use its merge-base with the target branch instead.
4. The checker reads the current working-tree lockfile. Confirm that it represents the update being evaluated; do not attribute unrelated local edits to a PR. If the reviewed snapshot is not available locally, obtain it in a separate location without disturbing the user's work, or report the check as unverified.

## Run the checker

Run the bundled [checker](./scripts/check-lockfile-duplicates.mjs) from the repository root. Arguments are the baseline Git ref and repository-relative lockfile path; defaults are `HEAD` and `yarn.lock`.

For local, uncommitted root updates:

```sh
node .agents/skills/lockfile-duplicates/scripts/check-lockfile-duplicates.mjs
```

For a PR, replace `<merge-base-sha>` with the SHA calculated above and run once for each changed lockfile:

```sh
node .agents/skills/lockfile-duplicates/scripts/check-lockfile-duplicates.mjs <merge-base-sha> yarn.lock
node .agents/skills/lockfile-duplicates/scripts/check-lockfile-duplicates.mjs <merge-base-sha> docs/yarn.lock
```

The root workspace and docs are separate Yarn projects. Do not combine their package counts or treat a version used in each project as a duplicate within one graph.

The script requires an installed `yaml` or `js-yaml` parser and supports modern Yarn YAML lockfiles. It fails if the baseline lockfile cannot be read or parsing fails; do not interpret a failed run as no duplicates. Do not install an ad hoc parser or change manifests merely to run the check. If neither parser is available, use an existing structured lockfile parser or report the prerequisite as missing.

## Interpret and investigate

- Each package record lists `before`, `after`, `added`, `increased`, and the current lockfile descriptors and resolutions grouped by version. A record is emitted only when the updated lockfile has multiple versions and at least one version was absent from the baseline.
- `increased: true` means the number of distinct versions grew. Records with `increased: false` still need review: a new version replaced another while duplicates remained, even if the total count shrank.
- Entries with the same package name and version count once, including virtual entries for different peer contexts. Distinct sources or patches with the same version are not counted as separate versions. This is a version-duplication check, not a complete dependency or security audit.
- The final summary counts packages and duplicated packages before and after. An unchanged or lower total does not rule out new duplicate trees; inspect the individual records. Findings are informational and do not cause a nonzero exit.
- Trace reported descriptors to their consumers with `yarn why '<package>'` and compare requested ranges, exact pins, resolutions, and peer requirements. Run graph commands from the owning project: root for `yarn.lock`, `docs` for `docs/yarn.lock`. Group related package families when explaining duplicated transitive trees.
- Still report an isolated package duplicated to satisfy separate consumer version ranges, but classify it as informational/low priority, not a critical issue or required fix. Incompatible ranges are a valid reason to retain multiple versions; do not recommend overrides or consumer upgrades solely to eliminate such duplication. Prioritize avoidable duplication within compatible ranges and duplicated transitive trees. Assess any independent security or compatibility risk separately.
- During a review, report actionable findings without changing dependencies unless fixes are requested. For authorized fixes, follow the [dependency-update workflow](../dependency-updates/SKILL.md): try targeted `yarn dedupe '<package-or-family-pattern>'`, respect release quarantine, and avoid forcing incompatible versions together. Re-run the checker against the same baseline after fixes and verify the resolved graph with `yarn info --all --recursive --json '<package-or-family-pattern>'`.

Report the baseline, lockfile, newly duplicated or changed duplicate versions, any increase in version count, consumer/range evidence, priority, and which duplicates should remain with reasons. Separate informational range-driven duplicates from actionable duplication. Distinguish pre-existing duplication from regressions; explicitly report a successful check with no new duplicate versions, or why the check could not run.
