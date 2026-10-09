const js = require('@eslint/js');
const globals = require('globals');
const prettier = require('eslint-config-prettier');

module.exports = [
  { ignores: ['node_modules/**', 'data/**', 'coverage/**'] },
  {
    files: ['**/*.{js,cjs,mjs}'],
    languageOptions: { ecmaVersion: 'latest' },
    rules: {
      ...js.configs.recommended.rules,
      'prefer-const': 'error',
    },
  },
  {
    files: ['src/**/*.js', 'servers/**/*.js', 'scripts/**/*.cjs', 'test/**/*.{js,cjs}', '*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: globals.node,
    },
  },
  {
    files: ['frontend/**/*.{js,mjs}'],
    languageOptions: {
      sourceType: 'module',
      globals: globals.browser,
    },
  },
  prettier,
];
