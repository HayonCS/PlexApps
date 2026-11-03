import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import { fixupPluginRules } from "@eslint/compat";
import typescriptParser from "@typescript-eslint/parser";
import jest from "eslint-plugin-jest";

export default [
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    ignores: ["**/*.gen.ts", "**/*.gen.tsx", "**/*.d.ts", "*-type-test.ts", ".storybook/*", "./dist/*"],
    plugins: {
      "react-hooks": fixupPluginRules(reactHooks),
      "@typescript-eslint": tseslint.plugin,
      react: pluginReact,
      jest,
    },
    languageOptions: {
      parser: typescriptParser,

      globals: { ...globals.jest, ...globals.node, ...globals.browser },
      parserOptions: {
        requireConfigFile: false,
        project: "tsconfig.json",
        sourceType: "module",
        warnOnUnsupportedTypeScriptVersion: false,
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "react/jsx-key": "error",
      "react/prop-types": 0,
      "react/no-children-prop": "warn",
      "react/no-unescaped-entities": "warn",
      "react/jsx-boolean-value": ["warn", "always"],
      "react/display-name": "warn",
      "@typescript-eslint/indent": "off",
      "@typescript-eslint/interface-name-prefix": "off",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-for-in-array": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-inferrable-types": 0,
      "@typescript-eslint/consistent-type-assertions": "warn",
      "@typescript-eslint/no-empty-interface": "warn",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "handle-callback-err": "error",
      "import/order": "off",
      "no-constant-condition": "error",
      "no-fallthrough": "error",
      "no-irregular-whitespace": "error",
      "no-multiple-empty-lines": "error",
      "no-restricted-imports": ["error", "lodash"],
      "no-unused-vars": 0,
      "no-async-promise-executor": 0,
      curly: ["error", "multi-line"],
      "no-case-declarations": "warn",
      "no-empty": "warn",
      "no-prototype-builtins": "warn",
      "no-redeclare": "warn",
      "no-undef": "error",
      "no-unreachable": "warn",
      "require-atomic-updates": "warn",
      "no-console": ["error", { allow: ["error", "warn", "info"] }],
    },
  },
];
