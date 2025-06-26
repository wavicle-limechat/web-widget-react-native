module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  plugins: ['react', 'react-hooks'],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    es6: true,
    node: true,
    jest: true,
  },
  globals: {
    __DEV__: 'readonly',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'no-console': 'warn', // Allow console statements but warn
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'react/prop-types': 'error',
    'react/display-name': 'off',
    'react-hooks/exhaustive-deps': 'warn',
  },
}; 