module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    quotes: ['error', 'single', { avoidEscape: true }],
    curly: ['error', 'all'],
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'off',
  },
};
