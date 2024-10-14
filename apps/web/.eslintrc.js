/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['next/core-web-vitals', '@repo/eslint-config/next.js'],
  rules: {
    'react-hooks/exhaustive-deps': 'off',
    'no-unused-vars': 'warn',
  },
  ignorePatterns: ['components/ui/*'],
  overrides: [
    {
      files: ['*.tsx', '*.ts'],
      rules: {
        'no-undef': 'off',
      },
    },
    {
      files: ['*.d.ts'],
      rules: {
        'no-unused-vars': 'off',
      },
    },
  ],
};
