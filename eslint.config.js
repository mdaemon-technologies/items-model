// ESLint flat config; src/__tests__/lint.test.ts checks which files it covers. typescript-eslint
// parses with the TypeScript 6 API (the `typescript` alias), while tsc type-checks with TypeScript 7.
import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
  // Built output, the coverage report, and the release notes the maintainer writes locally
  globalIgnores(['dist/', 'coverage/', 'release/']),
  // A stale eslint-disable comment fails the lint instead of warning
  { linterOptions: { reportUnusedDisableDirectives: 'error' } },
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.mts', '**/*.cts'],
    extends: [tseslint.configs.recommended],
    rules: {
      // The model holds items of any shape, and its published API (dist/items-model.d.ts) takes
      // and returns `any` by design. Narrowing those types is an API change, not a lint fix.
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    // The smoke tests and the config files run on plain Node. ESLint already reads .cjs files as CommonJS.
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    languageOptions: { globals: globals.node },
  },
])
