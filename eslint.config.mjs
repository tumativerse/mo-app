import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Archived code:
    'archive/**',
    '**/archive/**',
    // Test coverage reports:
    'coverage/**',
  ]),
  // Design System Enforcement
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    ignores: [
      '**/*.test.{ts,tsx}',
      '**/*.spec.{ts,tsx}',
      '**/color-picker.tsx',
      '**/celebrations.ts',
      'app/layout.tsx', // Uses theme-color meta tag which requires hex
      'lib/design/tokens.ts', // Design token definitions - source of truth
      'lib/contexts/theme-*.tsx', // Theme providers need hex for meta tags
      'lib/db/schema.ts', // Database schema default values
      'lib/mo-self/preferences/settings.ts', // Settings with color defaults
      'lib/micro-interactions.ts', // Animation library with color effects
      'tests/fixtures/**', // Test data fixtures
    ],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/^#[0-9a-fA-F]{3,6}$/]',
          message:
            'Use design tokens from Tailwind config instead of hardcoded hex colors. See .claude/rules/design-system.md',
        },
        {
          selector: 'Literal[value=/^rgb\\(/]',
          message:
            'Use design tokens from Tailwind config instead of rgb() colors. See .claude/rules/design-system.md',
        },
        {
          selector: 'Literal[value=/^rgba\\(/]',
          message:
            'Use design tokens from Tailwind config instead of rgba() colors. See .claude/rules/design-system.md',
        },
      ],
    },
  },
  // Deprecated Pattern Enforcement
  {
    files: ['**/*.ts', '**/*.tsx'],
    ignores: [
      'lib/mo-self/history/streaks.ts', // Reads from legacy workouts table for historical data
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/db/schema*'],
              importNames: ['programs', 'programDays', 'workouts', 'workoutSets', 'userPrograms'],
              message:
                'These tables are deprecated. Use programTemplates, templateDays, workoutSessions instead. See MEMORY.md line 77-86.',
            },
          ],
        },
      ],
    },
  },
  // Theme Toggle Exception
  {
    files: ['components/theme-toggle.tsx'],
    rules: {
      'react-hooks/set-state-in-effect': 'off', // Recommended pattern by next-themes to prevent hydration mismatch
    },
  },
]);

export default eslintConfig;
