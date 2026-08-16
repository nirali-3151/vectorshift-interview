import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import reactCompiler from 'eslint-plugin-react-compiler';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactHooks.configs.flat['recommended-latest'],
  reactRefresh.configs.vite,
  reactCompiler.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { varsIgnorePattern: '^[A-Z_]' },
      ],
    },
  },
  {
    // Every feature exposes its public surface through its own index.ts/tsx.
    // Reaching past that barrel couples callers to internals that are free
    // to move, so route all cross-feature imports through @/features/<name>.
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/features/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@/features/*/*',
                './features/*/*',
                '../features/*/*',
                '../../features/*/*',
              ],
              message:
                "Import features through their barrel (e.g. '@/features/pipeline'), not their internals.",
            },
          ],
        },
      ],
    },
  },
  {
    // Shared code (components/lib/hooks) must stay reusable outside this app,
    // so it may not depend on any feature's domain logic.
    files: [
      'src/components/**/*.{ts,tsx}',
      'src/lib/**/*.{ts,tsx}',
      'src/hooks/**/*.{ts,tsx}',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*', '../features/*', '../../features/*'],
              message: 'Shared code must not depend on features.',
            },
          ],
        },
      ],
    },
  }
);
