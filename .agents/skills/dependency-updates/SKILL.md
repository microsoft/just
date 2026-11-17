---
name: dependency-updates
description: "Update dependencies and resolve Dependabot security alerts in Just's root Yarn workspace and separate VuePress docs project. Use when upgrading packages, reviewing Dependabot PRs, applying security fixes, checking Yarn quarantine eligibility, deduplicating dependency trees, reviewing resolutions, or reporting remaining vulnerable dependencies."
---

# Dependency updates

## Scope and safeguards

- Start with the requested package, manifest, lockfile, or advisory. Inspect `git status --short` and preserve user edits and commits made during the session.
- The root Yarn workspace and `docs` are separate Yarn projects. Root and workspace package manifests share the root `yarn.lock`; docs uses `docs/package.json` and `docs/yarn.lock`. Install from the owning Yarn project and run validation commands from their documented directories. If both projects are in scope, handle their dependency graphs and lockfiles separately.
- Read the project's `.yarnrc.yml`, manifest `engines`, `resolutions`, and `rationale`, plus affected workspace package requirements and any applicable `.nvmrc` (currently at the root only). Root and docs Node requirements can differ, and a published package may support older Node versions than the development shell. Preserve each project's supported runtime range unless changing it is authorized.
- Root workspaces use the `prod` and `dev` catalogs in `.yarnrc.yml`. Update shared catalog ranges there rather than replacing `catalog:` references with individual manifest versions.
- Keep `npmMinimalAgeGate` unchanged in each affected project. Both currently use an eight-day quarantine, but read their configuration rather than assuming it will stay identical. Do not bypass it with exclusions, direct URLs, or other resolution tricks.
- Do not stage, stash, commit, create a branch, or dismiss alerts without authorization. Generate Beachball change files only when requested or required by the applicable release workflow.
- Use `rg` for targeted searches. Include `--no-ignore --follow` when inspecting installed dependencies, which may be ignored or symlinked. Resolve dependencies from their actual consumer with `createRequire` rather than assuming hoisting.

## Collect and classify alerts

This is a GitHub repository, so use `gh api` to get alerts. When an alert snapshot is requested, save only open alerts by default. Run this from the repository root, using an unused temporary filename:

```sh
GH_PAGER=cat gh api 'repos/microsoft/just/dependabot/alerts?state=open&per_page=100' --paginate --slurp > dependabot-alerts.tmp.json
```

Keep the complete response for each open alert, including advisory details; fetch closed alerts only when explicitly needed. `--slurp` wraps the pages in an outer array; flatten one level when processing it. Do not combine `gh --slurp` with `gh --jq`; pipe to `jq` instead. This example includes both project lockfiles and retains the manifest so alerts can be routed to the correct project; narrow the filter if only one project was requested:

```sh
jq '[.[][] | select(.state == "open" and (.dependency.manifest_path == "yarn.lock" or .dependency.manifest_path == "docs/yarn.lock")) | {number, manifest: .dependency.manifest_path, package: .dependency.package.name, severity: .security_advisory.severity, vulnerable: .security_vulnerability.vulnerable_version_range, fixed: .security_vulnerability.first_patched_version.identifier, ghsa: .security_advisory.ghsa_id}]' dependabot-alerts.tmp.json
```

Compare alerts with the current local dependency graph, not just GitHub's default-branch status. From the affected project, inspect exact versions and dependency descriptors. For example:

```sh
yarn info --all --recursive --json 'some-dep' 'other-dep'
```

Run graph queries from the repository root for root workspace dependencies, or from `docs` for docs dependencies. Parse the JSON lines for repeatable version and deduplication assertions. Do not assume a Yarn lockfile parser is installed. Use `yarn why` or nearby lockfile entries to identify the owning dependency.

Classify each alert as vulnerable locally, fixed locally, removed from the local tree, quarantined, or lacking a published fix. An open GitHub alert does not prove that the local branch is still vulnerable. Conversely, an unused vulnerable dependency is not fixed merely because its execution path is disabled.

## Respect release quarantine

When reviewing a Renovate "lock file maintenance" PR, quarantine compliance does not need to be verified separately: Renovate lock file maintenance respects quarantine. Other review checks still apply, including checking for newly duplicated dependency trees.

When reviewing a Dependabot PR, verify that each updated package version in the proposed lockfile satisfies the affected project's configured `npmMinimalAgeGate`, using its registry publication timestamp and a freshly checked current time. Do not assume Dependabot or passing CI enforces this policy. If any updated version is still quarantined, recommend rejecting the PR. The review comment must identify the package and version and include the exact datetime when quarantine clears in both UTC and Pacific time (`America/Los_Angeles`, labeled PST or PDT as applicable at that datetime). Do not close the PR without authorization.

How to review quarantine compliance:

1. Read all matching ranges in `security_advisory.vulnerabilities`, not only the alert's first patched version. Different major versions can have different fixes.
2. Query npm registry metadata for the candidate release's publication timestamp, engines, dependency ranges, and peer requirements. A null first-patched field is not conclusive: inspect newer releases and upstream advisories, without assuming every newer version fixes the issue.
3. Calculate eligibility as the publication timestamp plus the configured quarantine duration. Use exact UTC timestamps and a freshly checked current time; do not reuse dates from an old report.
4. If the necessary fixed release is too young, leave that dependency unchanged and report the fixed version and earliest eligible UTC date. Continue with unrelated eligible fixes.
5. If no fix is published, report that explicitly. Do not downgrade outside an advisory range or substitute a different package without compatibility evidence and appropriate scope approval.

Query metadata from the affected project directory with `npm view --json <package>@<version>` (or an equivalent command that respects the project's configured registry and scope mappings), rather than hardcoding `registry.npmjs.org`. Parse the JSON to inspect `time[version]`, `engines`, `dependencies`, and `peerDependencies`. For example:

```sh
npm view --json '<package>@<version>'
npm view --json '<package>' time
```

Keep Yarn's age gate enabled during install as an additional enforcement check.

## Choose the smallest supported upgrade

First, if a quarantine-eligible fixed version satisfies the existing dependency ranges, update that dependency directly within those ranges. For a transitive dependency, refresh its lockfile resolution without adding an override or upgrading its parent unnecessarily.

If the fix is out of range, prefer upgrading the owning package (or a higher parent) to a supported release that naturally includes the fixed dependency. Before overriding a transitive major version, inspect the consumer's actual API calls, upstream migration notes, runtime requirements, and a focused behavior check.

Use a targeted resolution only when needed. Put root workspace resolutions in the root manifest and docs resolutions in the docs manifest. Scope each to the relevant parent or descriptor and explain it in the existing `rationale.resolutions` object. Remove obsolete resolutions and rationale when their purpose disappears; retain unrelated compatibility pins.

Example scenarios and decisions:

- **Scenario:** A transitive security fix requires a new major version, but a newer parent release already supports it. **Decision:** Upgrade the parent rather than force an unsupported transitive version through a resolution; validate the affected integration.
- **Scenario:** A framework publishes coordinated packages that must stay on matching versions, and its newer release raises runtime requirements. **Decision:** Upgrade the related packages together within the requested release line, check quarantine eligibility, and align the affected project's runtime configuration and CI without changing unrelated projects.
- **Scenario:** A vulnerable dependency is used only by an opt-in feature that this project does not enable. **Decision:** Update the dependency for security, but do not assume a yarn patch is needed. Inspect the actual usage and API changes, and validate the feature-specific path if compatibility changes are necessary; the default build does not cover it.
- **Scenario:** A toolchain pulls in a dependency that appears unnecessary for this project's workflow. **Decision:** Suppress it only after confirming that installation, builds, and supported workflows do not require it. Treat suppression as an intentional dependency change, not a substitute for a security fix or a way around quarantine.

### Check for newly duplicated dependency trees

Run the [lockfile-duplicates skill](../lockfile-duplicates/SKILL.md) when evaluating Renovate lock file maintenance PRs, reviewing other dependency updates, and after making dependency changes. Use the PR merge-base for committed updates or `HEAD` for uncommitted edits, and check each affected lockfile separately.

Review the lockfile diff after each update for packages that previously shared a resolved version but now have multiple versions, especially related package families that bring duplicate transitive trees. Trace the new versions to their consumers and compare requested ranges, exact pins, existing resolutions, and peer requirements.

First try `yarn dedupe '<package-or-family-pattern>'` from the owning Yarn project to consolidate compatible versions within existing ranges, without adding resolutions. Review the resulting lockfile diff for unexpected changes and check release quarantine eligibility. Remove or update stale resolutions that unnecessarily retain an older tree. If an exact upstream pin prevents consolidation, use a narrowly scoped resolution only with compatibility evidence and a rationale, while respecting release quarantine.

Verify the resulting versions with `yarn info --all --recursive --json '<package-or-family-pattern>'`. Distinguish real duplicate versions from Yarn virtual instances for different peer contexts. Do not force incompatible major versions or peer requirements onto a single version merely to shrink the lockfile; explain any newly duplicated trees that must remain.

### Patch devDependencies only when necessary

`yarn patch` is acceptable only for `devDependencies` and their exclusively development-only transitive dependencies. Never patch a runtime dependency, including a package also reachable through `dependencies`. For the root workspace, check paths across all workspaces, including dependencies shipped in published packages or bundles; a root devDependency declaration alone does not establish development-only usage. Apply the same restriction to the docs dependency graph. Do not reclassify a dependency merely to permit a patch. For runtime dependencies, use an upstream fix or supported upgrade, or report the blocker.

Even for eligible development dependencies, use Yarn's patch workflow only for a demonstrated incompatibility that cannot be handled by the selected supported upgrade:

```sh
yarn patch <dev-package>@npm:<installed-version>
# Edit only the necessary files in the extracted directory.
yarn patch-commit -s <extracted-directory>
yarn install
```

Use `apply_patch` for manual edits to the extracted files. Here `patch-commit -s` saves the Yarn patch; it is not a Git commit or staging operation. Store patches under the affected project's `.yarn/patches`, ensure Git does not ignore them, and avoid redundant direct-dependency and resolution patch references. Validate the specific changed execution path.

If the patch is unnecessary, remove its file, manifest references, rationale, and any ignore exception introduced solely for it; regenerate the lockfile while keeping the requested security pin.

## Install and validate

1. Preserve the existing lockfile and run `yarn install` in the affected project. Do not delete the lockfile by default: full regeneration can introduce unrelated churn or quarantine failures.
2. Immediately run the cheapest check that can disprove the compatibility assumption, using the affected project's own tests or build commands. Keep root workspace and VuePress docs validation separate. Do not retry a user-cancelled check without considering the user's latest direction; report it as unverified when appropriate.
3. Follow root or docs validation steps below. (Files will be automatically formatted with Prettier on commit.)
4. Inspect the final diff and resolved graph. Verify that targeted vulnerable versions and unnecessary patches are gone, intended pins remain, and the quarantine setting is unchanged. Record pre-existing warnings separately from regressions.

### Root-workspace validation

For root tooling or workspace package changes, run the affected package's focused tests, build, and lint checks using its existing scripts. Run package-specific commands from `packages/<name>` (or the relevant workspace directory). Root `yarn test` runs through Lage and does not accept Jest options; pass test filters to the package's own `yarn test` command instead of running Jest directly.

If changes span multiple packages, run `yarn build` from the repository root so dependencies build in order. Verify supported runtime and published dependency contracts, not only the active development Node version. The root `yarn ci:local` script runs workspace build, tests, lint, and API updates, not the separate docs build.

### Docs-only validation

For docs dependency updates, run `yarn build` from `docs` to validate the VuePress static-site build. Use `yarn dev` when a development-server change needs validation. Fix relevant migration issues without expanding into unrelated cleanup.

## Report the outcome

When requested, create an untracked temporary Markdown report such as `dependabot-alerts.tmp.md`. Cover only the requested scope; if both projects are included, group findings by `yarn.lock` and `docs/yarn.lock`. Include:

- Check date, affected manifest, and location of any full JSON snapshot.
- Alert links and numbers, package, severity, current version, and fixed version.
- Separate sections for still vulnerable locally and addressed locally, including removed dependencies.
- Exact quarantine eligibility dates or an explicit no-published-fix status.
- Compatibility caveats and validation commands that passed, failed, or were not run.

Do not silently treat an earlier snapshot as current. GitHub's status can lag local fixes until the updated default branch is scanned. Leave temporary reports and raw JSON out of commits unless the user explicitly requests them, and never claim an alert was closed merely because a local update passed.
