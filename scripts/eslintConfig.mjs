// @ts-check
import globals from 'globals';
import pluginJs from '@eslint/js';
import eslint from 'eslint/config';
import prettier from 'eslint-config-prettier/flat';
import tseslint from 'typescript-eslint';
import path from 'path';

const repoRoot = path.resolve(import.meta.dirname, '..');

/**
 * @param {string} dirname - The package directory (use `import.meta.dirname`)
 * @param {...import('eslint').Linter.Config} configs - Additional per-package config overrides
 */
export function getConfig(dirname, ...configs) {
  return eslint.defineConfig(
    eslint.includeIgnoreFile(path.join(repoRoot, '.gitignore')),
    eslint.includeIgnoreFile(path.join(repoRoot, '.prettierignore')),
    { ignores: ['lib/**/*', 'dist/**/*', '*.config.*'] },

    pluginJs.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
    prettier,
    {
      languageOptions: {
        globals: globals.node,
        parserOptions: {
          projectService: true,
          tsconfigRootDir: dirname,
        },
      },
      linterOptions: {
        reportUnusedDisableDirectives: 'error',
      },
    },
    {
      rules: {
        '@typescript-eslint/no-non-null-assertion': 'error',
        '@typescript-eslint/no-shadow': 'error',
        '@typescript-eslint/no-unused-expressions': ['error', { allowShortCircuit: true }],
        '@typescript-eslint/prefer-for-of': 'error',
        '@typescript-eslint/consistent-type-imports': ['error', { disallowTypeAnnotations: false }],
        '@typescript-eslint/consistent-type-exports': 'error',
        '@typescript-eslint/explicit-module-boundary-types': 'error',
        '@typescript-eslint/no-import-type-side-effects': 'error',

        // Should be enabled
        '@typescript-eslint/no-explicit-any': 'off',

        '@typescript-eslint/no-restricted-imports': [
          'error',
          {
            paths: [
              {
                name: 'node:test',
                message: 'You probably meant to import from "@jest/globals"',
              },
            ],
          },
        ],
        'no-restricted-syntax': [
          'error',
          {
            // copilot likes to write "as never" casts in tests
            selector: 'TSAsExpression > TSNeverKeyword',
            message: 'Cast to specific types and/or unknown instead',
          },
        ],

        // Downgrade type-checked rules that produce excessive noise
        '@typescript-eslint/no-unsafe-argument': 'warn',
        '@typescript-eslint/no-unsafe-assignment': 'warn',
        '@typescript-eslint/no-unsafe-call': 'warn',
        '@typescript-eslint/no-unsafe-member-access': 'warn',
        '@typescript-eslint/no-unsafe-return': 'warn',

        // Disabled until ESM migration
        '@typescript-eslint/no-require-imports': 'off',

        // Disabled permanently
        'no-undef': 'off',
        '@typescript-eslint/restrict-template-expressions': 'off',
        // redundant with noUnusedLocals etc
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
    {
      files: ['**/*.js', '**/*.mjs'],
      languageOptions: {
        parserOptions: {
          sourceType: 'module',
        },
      },
      rules: {
        // Rule doesn't handle JS files
        '@typescript-eslint/explicit-module-boundary-types': 'off',
      },
    },
    {
      files: ['src/**/*.{spec,test}.ts'],
      rules: {
        '@typescript-eslint/no-non-null-assertion': 'off',
      },
    },
    {
      files: ['src/**/__*/**/*'],
      rules: {
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        'no-restricted-properties': [
          'error',
          ...['describe', 'it', 'test']
            .map(func => [
              { object: func, property: 'only', message: 'Do not commit .only() tests' },
              { object: func, property: 'skip', message: 'Do not commit .skip() tests (disable this rule if needed)' },
            ])
            .flat(),
        ],
        // Use the ESLint version of the rule to avoid overriding the restricted imports from the base config
        'no-restricted-imports': [
          'error',
          {
            paths: [
              {
                name: '@jest/globals',
                importNames: ['xdescribe', 'xit', 'xtest'],
                message: 'Do not commit disabled tests (disable this rule if needed)',
              },
            ],
          },
        ],
      },
    },
    {
      files: ['**/*.{js,cjs,mjs}'],
      extends: [tseslint.configs.disableTypeChecked],
    },
    ...configs,
  );
}
