import expo from 'eslint-config-expo/flat.js';

export default [
  ...expo,
  {
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  {
    ignores: ['dist/**', '.expo/**', 'node_modules/**'],
  },
];
