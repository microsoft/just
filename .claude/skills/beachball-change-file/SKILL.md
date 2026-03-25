---
name: beachball-change-file
description: How to create a Beachball change file. ONLY use this skill when the user asks to generate change files or before creating a PR.
---

Every pull request must include a [Beachball](https://microsoft.github.io/beachball/) change file under `/change`. Change files include the list of changed packages in a branch, with the description and semver change type for each package. After the PR is checked in and a release is run, the change files are used to determine version bumps and update changelogs.

Beachball normally uses a CLI with an interactive prompt to create change files, but they can also be created manually using the standardized JSON format detailed below.

## Creating a change file manually

1. Get the list of files with unstaged/untracked changes: `git ls-files -m` and `git ls-files -o --exclude-standard`. (Do not check the the diff contents.)
2. If there are any files from step 1, ask the user whether they would like to stage all files (`git add .`) or continue without staging. If they choose to stage, run `git add .` before proceeding.
3. Run `yarn beachball check --verbose` to get the list of changed packages and files detected by `beachball` (this excludes certain files such as tests).
   - The list of changed packages is under "Found changes in the following packages"
   - The list of changed files is under "changed files in current branch". Ignore any files with `~~` strikethrough formatting.
   - DO NOT use `git diff` to get the list of changed files, since this doesn't respect beachball's `ignorePatterns` setting
4. Create a single change file under `change/change-<random guid>.json` with a `changes` entry for each package. See below for the change file format.
5. Currently, Beachball only detects change files that have been committed, so the new change file will need to be committed before verification. Ask the user if they'd like to commit the change file and other staged changes. If yes, `git add` the change file, commit all staged changes with an informative message, then re-run `beachball check` to verify.

## Change file format

Each change file is located under `change/change-<random guid>.json`. It has the following format, with a `changes` entry for each changed package:

```json
{
  "changes": [
    {
      "packageName": "",
      "type": "",
      "dependentChangeType": "",
      "comment": "",
      "email": ""
    }
  ]
}
```

Each package's entry has the following values:

- `packageName`: The name of the changed package, e.g. `just-task`
- `type`: The semantic versioning change type for the package: `<patch|minor|major|none>`. Determine this based on the diff content of changed files in that package:
  - **"patch"**: Bug fixes or other changes that don't impact exported API signatures.
  - **"minor"**: New exported APIs, non-breaking signature changes to exported APIs, or more significant changes to internal logic.
  - **"major"**: Breaking changes to exported APIs (removals or breaking signature changes), critical dependency updates, or behavior changes that might be breaking for the consumer. You MUST confirm with the user before choosing "major".
  - **"none"**: None of the changes will impact consumers of the package (e.g. the changes are only to non-exported test-specific files or documentation). If you're not certain, prefer "patch".
  - If not certain about the change type, ask the user to choose one of the options above based on the diff content.
- `dependentChangeType`: Change type for packages that depend on this package. If `type` is "none", this should be "none". Otherwise, this should be "patch".
- `comment`: A concise description of the changes made to the package. This will go in the changelog, so it should focus on user-facing changes rather than implementation details. This field accepts markdown formatting.
- `email`: User's email from `git config user.email`, or "email not defined" if not available.
