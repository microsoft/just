---
description: Create and validate Beachball change files. Use when the user asks to generate change files, prepare to push a branch, or prepare or create a pull request. Do not use for ordinary code changes or planning.
license: MIT
metadata:
  github-path: skills/beachball-change-file
  github-ref: refs/heads/main
  github-repo: https://github.com/microsoft/beachball
  github-tree-sha: 21ff9c990bdc69d7dd677e831d94da13bff91b63
  source: https://github.com/microsoft/beachball/blob/main/skills/beachball-change-file/SKILL.md
  version: 1.1.1
name: beachball-change-file
---

[Beachball](https://microsoft.github.io/beachball/) manages package versions and changelogs in JavaScript and TypeScript repositories. A change file records each changed package's changelog comment and semantic version bump. After a change is merged and released, Beachball uses these files to update package versions and changelogs.

Create change files manually using the workflow and JSON formats below. Do not use Beachball's interactive `change` command unless the user requests it.

## 1. Resolve repository context

Determine these values once and use them throughout the workflow:

- `<ROOT>`: almost always the git root. It should contain `beachball.config.*` or `.beachballrc.*` or have a `"beachball"` key in `package.json`. If not found, ask the user.
- `<BEACHBALL_COMMAND>`: the package-manager-specific way to invoke Beachball, such as `yarn beachball`, `pnpm exec beachball`, or `npm exec beachball --`.
- `<BEACHBALL_VERSION>`: the version from `<BEACHBALL_COMMAND> --version`
- `<CHECK_COMMAND>`: prefer a root `package.json` script that runs `beachball check`, because it may supply repository-specific arguments. Otherwise use `<BEACHBALL_COMMAND> check`. Include the package-manager-specific argument separator when passing `--verbose` through a script.
- `<CHANGE_DIR>`: the result of `<BEACHBALL_COMMAND> config get changeDir`, or `change/` if unset.
- `<GROUP_CHANGES>`: the result of `<BEACHBALL_COMMAND> config get groupChanges`; treat `false` and unset as non-grouped.
- `<TARGET_BRANCH>`: use the branch specified by the user or pull request. Otherwise use the result of `<BEACHBALL_COMMAND> config get branch`, or the repository's default branch if unset. Ask the user if it cannot be determined reliably.
- `<MERGE_BASE>`: the local merge-base of `HEAD` and `<TARGET_BRANCH>`. Do not merge the target branch to calculate it.
- `<INCLUDE_EMAIL>`: For Beachball 2.x, set this to `true`. For Beachball 3.x, use the result of `<BEACHBALL_COMMAND> config get changeFile.includeEmail`; set this to `false` only if the result is explicitly `false`; otherwise set it to `true`.
- `<EMAIL>`: the result of `git config user.email`. Never invent an email.

Run all commands from `<ROOT>` unless the repository's script requires otherwise.

## 2. Inspect the git state

Beachball considers committed and staged files, but not unstaged or untracked files. Before proceeding, check for unstaged or untracked paths:

- Unstaged tracked paths: `git ls-files -m`
- Untracked paths: `git ls-files -o --exclude-standard`

If any changes are unstaged or untracked, ask whether to stage those exact paths or continue without them.

## 3. Get the authoritative changes

Run `<CHECK_COMMAND> --verbose`, using the required argument separator if `<CHECK_COMMAND>` is a package script.

- Use only the packages under "Found changes in the following packages" as change-file entries. Beachball configuration may exclude packages or files that otherwise appear changed.
- Use the paths under "changed files in current branch" when reviewing the changes. Ignore paths shown with `~~` strikethrough formatting.
- Do not determine which packages need entries by scanning `<CHANGE_DIR>`. Beachball's package list already accounts for existing change files and repository configuration.

A nonzero exit caused by missing change files is expected at this stage; continue using the reported packages and paths. If the command failed because it could not run or load configuration, resolve or report that error before continuing. If no packages require entries, report that no change file is needed and stop.

## 4. Determine each entry

For each package reported by Beachball, gather:

- Its current `version` from `package.json`.
- Its disallowed types from `<BEACHBALL_COMMAND> config get disallowedChangeTypes --package <packageName>`.
- Its considered changes from `git diff --cached <MERGE_BASE> -- <reported-paths>`. This form includes committed and staged changes while excluding unstaged edits.
- Any relevant API report diff under the package's `etc/*.api.md`. A changed API report is strong evidence of a public signature change; an unchanged or absent report does not prove that the API is unchanged.

Gather independent values for all reported packages in parallel when the available tools allow it.

Choose `type` using this table, then ensure the type is not disallowed:

<!-- prettier-ignore -->
| Package version | Consumer impact | `type` |
| --------------- | --------------- | ------ |
| Any | No consumer-visible effect, such as test-only or internal documentation changes | `none` |
| Prerelease | Any consumer-visible effect | `prerelease` |
| Stable `0.x` | Breaking API or behavior change | `minor` |
| Stable `0.x` | Any other consumer-visible change | `patch` |
| Stable `>=1.0.0` | Breaking API or behavior change | `major`, after user confirmation |
| Stable `>=1.0.0` | New backward-compatible public functionality | `minor` |
| Stable `>=1.0.0` | Backward-compatible fix or behavior correction | `patch` |

For a stable package, use `prerelease`, `premajor`, `preminor`, or `prepatch` only when explicitly requested. For a prerelease package, use another prerelease type only when explicitly requested or when all normal choices are disallowed. If the inferred type is disallowed and there is no unambiguous allowed replacement, ask the user. If impact remains uncertain, prefer the consumer-impacting type (`patch` for stable packages or `prerelease` for prerelease packages).

Set the remaining values as follows:

- `packageName`: the exact package name reported by Beachball.
- `dependentChangeType`: Depends on `<BEACHBALL_VERSION>`:
  - 2.x: unless explicitly requested by the user, use `none` for change type `none`, and `patch` for all other change types.
  - 3.x: Only include this if the user explicitly requests non-default dependent bump behavior.
- `comment`: a concise, user-facing description suitable for a changelog. Emphasize API or behavior changes rather than implementation details, and wrap code identifiers in backticks.
- `email`: omit this if `<INCLUDE_EMAIL>` is `false`. Otherwise use `<EMAIL>`. If `<EMAIL>` is not available, behavior depends on `<BEACHBALL_VERSION>`:
  - 2.x: use `email not defined`.
  - 3.x: omit the email.

Ask the user only about unresolved classifications and any proposed `major` bump. When multiple packages need input, ask about them together.

## 5. Create the change files

Generate one random UUID per output file. When multiple files are needed, generate all UUIDs in one command, for example: `node -e "console.log(Array.from({ length: Number(process.argv[1]) }, () => crypto.randomUUID()).join('\n'))" <count>`.

If `<GROUP_CHANGES>` is false or unset, create `<CHANGE_DIR>/<packageName>-<uuid>.json` for each package:

```json
{
  "packageName": "example-package",
  "type": "patch",
  "comment": "Fix an issue affecting consumers",
  "email": "user@example.com"
}
```

If `<GROUP_CHANGES>` is true, create one `<CHANGE_DIR>/change-<uuid>.json` containing every package reported by Beachball:

```json
{
  "changes": [
    {
      "packageName": "example-package",
      "type": "patch",
      "comment": "Fix an issue affecting consumers",
      "email": "user@example.com"
    }
  ]
}
```

Use the actual values determined above; the examples are illustrative only.

## 6. Validate the result

Beachball cannot validate new untracked change files. If staging permission was not already granted, ask before staging only the exact files just created.

After staging the generated files, rerun `<CHECK_COMMAND>` without `--verbose`. Validation succeeds when the command exits successfully. If the user declines staging, validate the files as JSON and explain that full Beachball validation requires them to be staged.
