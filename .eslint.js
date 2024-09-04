module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
    ],
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
    rules: {
      'no-console': 'warn', // Warns on console statements, which can be useful for debugging but should be avoided in production
      'semi': ['error', 'always'], // Enforces semicolons
      '@typescript-eslint/no-explicit-any': 'off', // Allows the use of 'any' type
    },
  };
  