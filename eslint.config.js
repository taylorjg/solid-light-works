import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import prettier from "eslint-plugin-prettier";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import vitest from "@vitest/eslint-plugin";
import globals from "globals";

export default [
  {
    ignores: ["dist/**"],
  },
  js.configs.recommended,
  eslintConfigPrettier,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      prettier,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...prettier.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
  {
    files: ["**/*.{test,spec}.{js,jsx}", "src/setupTests.js"],
    plugins: { vitest },
    rules: {
      ...vitest.configs.recommended.rules,
    },
    languageOptions: {
      globals: {
        ...vitest.environments.env.globals,
      },
    },
  },
  {
    files: ["vite.config.js", "eslint.config.js"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
];
