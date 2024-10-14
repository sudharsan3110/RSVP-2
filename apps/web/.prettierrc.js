const baseConfig = require('@repo/prettier-config/base.json');

module.exports = {
  ...baseConfig,
  plugins: ['prettier-plugin-tailwindcss'],
};
