/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: "next/core-web-vitals",
  plugins: ["testing-library", "jest-dom"],
  rules: {
    "react-hooks/exhaustive-deps": "off",
    "no-unused-vars": "warn",
  },
  overrides: [
    {
      files: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
      extends: ["plugin:testing-library/react", "plugin:jest-dom/recommended"],
    },
  ],
  ignorePatterns: ["components/ui/*"],
};
