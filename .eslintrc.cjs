/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'boundaries'],
  settings: {
    react: {
      version: 'detect',
    },
    'boundaries/elements': [
      { type: 'domain', pattern: 'domain/*' },
      { type: 'components', pattern: 'components/*' },
      { type: 'pages', pattern: 'pages/*' },
      { type: 'util', pattern: 'util/*' },
      { type: 'store', pattern: 'store/*' },
      { type: 'types', pattern: 'types/*' },
    ],
    'boundaries/ignore': [
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/setupTests.ts',
      '**/testUtils/*',
    ],
  },
  rules: {
    // Not needed with React 18+ automatic JSX transform
    'react/react-in-jsx-scope': 'off',
    // Downgrade to warn to match CRA's original permissiveness for pre-existing patterns
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-non-null-asserted-optional-chain': 'warn',
    'no-unused-vars': 'off', // Handled by @typescript-eslint/no-unused-vars above
    'boundaries/element-types': [
      'error',
      {
        default: 'disallow',
        rules: [
          { from: 'domain', allow: ['domain', 'types'] },
          {
            from: 'components',
            allow: ['components', 'domain', 'types', 'util', 'store'],
          },
          {
            from: 'pages',
            allow: ['pages', 'components', 'domain', 'types', 'util', 'store'],
          },
          { from: 'util', allow: ['util', 'types'] },
          { from: 'store', allow: ['store', 'domain', 'types'] },
          { from: 'types', allow: ['types'] },
        ],
      },
    ],
  },
  ignorePatterns: ['node_modules/', 'dist/', 'build/', 'coverage/', 'vite.config.ts'],
};
